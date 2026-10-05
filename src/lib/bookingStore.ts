import "server-only";

import { createClient, type RedisClientType } from "redis";
import { Redis } from "@upstash/redis";
import type { Booking } from "@/types/moxotoro";

const HASH_KEY = "moxo:bookings";

export type PersistenceMode = "redis" | "memory" | "off";

interface BookingStore {
  mode: Exclude<PersistenceMode, "off">;
  upsert(booking: Booking): Promise<void>;
  get(id: string): Promise<Booking | null>;
  list(): Promise<Booking[]>;
}

const memoryBookings = new Map<string, Booking>();

function memoryAllowed(): boolean {
  return process.env.MOXOTORO_MEMORY_BOOKINGS === "1" && process.env.NODE_ENV !== "production";
}

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function tcpRedisUrl(): string | undefined {
  const url = process.env.KV_REDIS_URL ?? process.env.REDIS_URL;
  if (!url) return undefined;
  return url;
}

let tcpClient: RedisClientType | null = null;
let tcpConnecting: Promise<RedisClientType> | null = null;

function getTcpClient(): Promise<RedisClientType> {
  if (tcpClient?.isOpen) return Promise.resolve(tcpClient);
  if (!tcpClient && tcpConnecting) return tcpConnecting;

  const url = tcpRedisUrl();
  if (!url) return Promise.reject(new Error("Falta KV_REDIS_URL."));

  const stale = tcpClient;
  tcpClient = null;
  tcpConnecting = null;
  if (stale) {
    stale.removeAllListeners();
    void stale.disconnect().catch(() => undefined);
  }

  const client: RedisClientType = createClient({
    url,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 5_000,
      reconnectStrategy(retries) {
        if (retries > 3) return new Error("Redis no disponible");
        return Math.min(retries * 200, 1_000);
      },
    },
  });
  client.on("error", (error: unknown) => {
    const message = error instanceof Error ? error.message : "error de conexión";
    console.error("Redis:", message);
  });

  tcpConnecting = client
    .connect()
    .then(() => {
      tcpClient = client;
      return client;
    })
    .catch((error: unknown) => {
      tcpConnecting = null;
      tcpClient = null;
      client.removeAllListeners();
      void client.disconnect().catch(() => undefined);
      throw error;
    });

  return tcpConnecting;
}

function parseStoredBooking(raw: string): Booking | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || typeof (value as { id?: unknown }).id !== "string") return null;
    return value as Booking;
  } catch {
    return null;
  }
}

function upstashStore(): BookingStore | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return {
    mode: "redis",
    async upsert(booking) {
      await redis.hset(HASH_KEY, { [booking.id]: booking });
    },
    async get(id) {
      const value = await redis.hget<Booking>(HASH_KEY, id);
      return value ?? null;
    },
    async list() {
      const all = await redis.hgetall<Record<string, Booking>>(HASH_KEY);
      if (!all) return [];
      return Object.values(all).filter((item) => item && typeof item === "object" && typeof item.id === "string");
    },
  };
}

function tcpStore(): BookingStore {
  return {
    mode: "redis",
    async upsert(booking) {
      const client = await getTcpClient();
      await client.hSet(HASH_KEY, booking.id, JSON.stringify(booking));
    },
    async get(id) {
      try {
        const client = await getTcpClient();
        const raw = await client.hGet(HASH_KEY, id);
        if (!raw) return null;
        return parseStoredBooking(raw);
      } catch (error) {
        console.error("Redis get:", error instanceof Error ? error.message : error);
        return null;
      }
    },
    async list() {
      try {
        const client = await getTcpClient();
        const all = await client.hGetAll(HASH_KEY);
        return Object.values(all)
          .map((raw) => parseStoredBooking(raw))
          .filter((item): item is Booking => item !== null);
      } catch (error) {
        console.error("Redis list:", error instanceof Error ? error.message : error);
        return [];
      }
    },
  };
}

function memoryStore(): BookingStore {
  return {
    mode: "memory",
    async upsert(booking) {
      memoryBookings.set(booking.id, booking);
    },
    async get(id) {
      return memoryBookings.get(id) ?? null;
    },
    async list() {
      return [...memoryBookings.values()];
    },
  };
}

export function getBookingStore(): BookingStore | null {
  if (upstashConfigured()) return upstashStore();
  if (tcpRedisUrl()) return tcpStore();
  return memoryAllowed() ? memoryStore() : null;
}

export function persistenceMode(): PersistenceMode {
  if (upstashConfigured() || tcpRedisUrl()) return "redis";
  if (memoryAllowed()) return "memory";
  return "off";
}
