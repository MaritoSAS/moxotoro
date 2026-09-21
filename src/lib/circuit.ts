import geojsonData from "@/data/camino_real.geojson";
import type { CircuitStop } from "@/types/moxotoro";

export const WALPAC_STOP_ID = "stop-walpac";

/** GeoJSON and MapLibre both use [longitude, latitude]. */
export function asLngLat(coordinates: number[]): [number, number] {
  return [Number(coordinates[0]), Number(coordinates[1])];
}

export function getCircuitStops(): CircuitStop[] {
  return geojsonData.features
    .filter(
      (feature) =>
        feature.properties.type === "stop" &&
        feature.properties.id &&
        feature.geometry.type === "Point"
    )
    .map((feature) => {
      const properties = feature.properties;
      return {
        id: String(properties.id),
        order: Number(properties.order ?? 0),
        name: String(properties.name ?? ""),
        subtitle: String(properties.subtitle ?? ""),
        description: String(properties.description ?? ""),
        duration: String(properties.duration ?? ""),
        elevation: String(properties.elevation ?? ""),
        image: String(properties.image ?? ""),
        isComplementary: Boolean(properties.isComplementary),
        coordinates: asLngLat(feature.geometry.coordinates as number[]),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getCircuitMapView(): { center: [number, number]; zoom: number } {
  const officialStops = getCircuitStops().filter((stop) => !stop.isComplementary);
  const lngs = officialStops.map((stop) => stop.coordinates[0]);
  const lats = officialStops.map((stop) => stop.coordinates[1]);
  return {
    center: [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2,
    ],
    zoom: 16,
  };
}
