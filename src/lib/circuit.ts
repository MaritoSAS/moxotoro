import geojsonData from "@/data/camino_real.geojson";
import type { CircuitStop } from "@/types/moxotoro";

export const WALPAC_STOP_ID = "stop-walpac";

export function getCircuitStops(): CircuitStop[] {
  return geojsonData.features
    .filter((feature) => feature.properties.type === "stop" && feature.properties.id)
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
        coordinates: feature.geometry.coordinates as [number, number],
      };
    })
    .sort((a, b) => a.order - b.order);
}
