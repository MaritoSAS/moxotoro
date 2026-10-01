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

function redisStore(): BookingStore | null {
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
  return redisStore() ?? (memoryAllowed() ? memoryStore() : null);
}

export function persistenceMode(): PersistenceMode {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return "redis";
  if (memoryAllowed()) return "memory";
  return "off";
}
