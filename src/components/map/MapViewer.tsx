"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import geojsonData from "@/data/camino_real.json";
import { CircuitStop } from "@/types/moxotoro";
import { MapPin, Navigation, Maximize2, Compass, Layers, CheckCircle2 } from "lucide-react";

interface MapViewerProps {
  selectedStopId: string | null;
  onSelectStop: (stop: CircuitStop) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({ selectedStopId, onSelectStop }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<{ [id: string]: Marker }>({});
  const [activeStop, setActiveStop] = useState<CircuitStop | null>(null);

  // Extract stops from GeoJSON
  const stops: CircuitStop[] = (geojsonData.features as any[])
    .filter((f) => f.properties.type === "stop")
    .map((f) => ({
      id: f.properties.id,
      order: f.properties.order,
      name: f.properties.name,
      subtitle: f.properties.subtitle,
      description: f.properties.description,
      duration: f.properties.duration,
      elevation: f.properties.elevation,
      image: f.properties.image,
      isComplementary: f.properties.isComplementary,
      coordinates: f.geometry.coordinates as [number, number],
    }));

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center coordinates around Plaza San Martin / Camino Real La Caldera
    const initialCenter: [number, number] = [-65.381, -24.599];

    // OpenStreetMap & Carto Positron basemap (Cero costo, cero API key)
    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors © CARTO",
          },
        },
        layers: [
          {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: initialCenter,
      zoom: 14.5,
      pitch: 35, // 3D perspective to emphasize the valley and terrain
    });

    map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), "top-right");

    map.on("load", () => {
      // 1. Add trail LineString
      map.addSource("camino-real-trail", {
        type: "geojson",
        data: geojsonData as any,
      });

      // Trail outer glow / shadow
      map.addLayer({
        id: "trail-glow",
        type: "line",
        source: "camino-real-trail",
        filter: ["==", "$type", "LineString"],
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0d3d47",
          "line-width": 8,
          "line-opacity": 0.5,
        },
      });

      // Trail main line
      map.addLayer({
        id: "trail-line",
        type: "line",
        source: "camino-real-trail",
        filter: ["==", "$type", "LineString"],
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#c4a962",
          "line-width": 4,
          "line-opacity": 0.95,
        },
      });

      // 2. Add custom markers for each stop
      stops.forEach((stop) => {
        const el = document.createElement("div");
        el.className = "custom-map-marker";
        el.style.width = "34px";
        el.style.height = "34px";
        el.style.borderRadius = "50%";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.cursor = "pointer";
        el.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
        el.style.border = stop.isComplementary ? "2px solid #dfc888" : "2px solid #0a0a0a";
        el.style.background = stop.isComplementary ? "#0d3d47" : "#c4a962";
        el.style.color = stop.isComplementary ? "#dfc888" : "#0a0a0a";
        el.style.fontWeight = "bold";
        el.style.fontSize = "12px";
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
        el.innerHTML = stop.isComplementary ? "✦" : `${stop.order}`;

        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.2)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1.0)";
        });

        el.addEventListener("click", () => {
          onSelectStop(stop);
          setActiveStop(stop);
          map.flyTo({
            center: stop.coordinates,
            zoom: 16,
            duration: 1200,
          });
        });

        const marker = new Marker({ element: el })
          .setLngLat(stop.coordinates)
          .addTo(map);

        markersRef.current[stop.id] = marker;
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // When selectedStopId changes externally from the list
  useEffect(() => {
    if (!selectedStopId || !mapRef.current) return;
    const target = stops.find((s) => s.id === selectedStopId);
    if (target) {
      setActiveStop(target);
      mapRef.current.flyTo({
        center: target.coordinates,
        zoom: 16,
        duration: 1200,
      });
    }
  }, [selectedStopId]);

  const resetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [-65.381, -24.599],
      zoom: 14.5,
      pitch: 35,
      duration: 1200,
    });
    setActiveStop(null);
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#c4a962]/30 bg-[#0d1b2a] shadow-2xl">
      {/* Map canvas container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map header overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-[#0a0a0a]/85 backdrop-blur-md px-3.5 py-2 border border-[#c4a962]/30 text-xs shadow-lg">
        <Compass className="h-4 w-4 text-[#c4a962] animate-spin-slow" />
        <span className="font-semibold text-[#f5f0e8]">Valle de La Caldera</span>
        <span className="text-[#9ca3af]">·</span>
        <span className="text-[#c4a962]">2.8 km</span>
        <span className="text-[#9ca3af]">·</span>
        <span className="text-emerald-400">Dificultad Baja</span>
      </div>

      {/* Map actions */}
      <div className="absolute top-3 right-14 z-10 flex items-center gap-2">
        <button
          onClick={resetView}
          title="Restablecer vista del circuito completo"
          className="rounded-xl bg-[#0a0a0a]/85 backdrop-blur-md p-2 border border-[#c4a962]/30 text-xs text-[#e8e2d6] hover:text-[#c4a962] hover:bg-[#0d3d47] transition-colors shadow-lg"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Card for Active Selected Stop */}
      {activeStop && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-20 rounded-xl bg-[#0d1b2a]/95 backdrop-blur-md border border-[#c4a962]/40 p-4 shadow-2xl transition-all">
          <div className="flex items-start gap-3.5">
            <img
              src={activeStop.image}
              alt={activeStop.name}
              className="h-20 w-24 rounded-lg object-cover border border-[#c4a962]/30 shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded bg-[#c4a962]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#c4a962]">
                  {activeStop.isComplementary ? "Extensión Complementaria" : `Parada ${activeStop.order} de 5`}
                </span>
                <span className="text-[11px] text-[#9ca3af]">{activeStop.duration}</span>
              </div>
              <h4 className="mt-1 font-semibold text-sm text-[#f5f0e8] truncate">{activeStop.name}</h4>
              <p className="text-[11px] text-[#c4a962]">{activeStop.subtitle}</p>
              <p className="mt-1 text-[11px] text-[#9ca3af] line-clamp-2 leading-relaxed">
                {activeStop.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map legend footer */}
      <div className="absolute bottom-2 right-2 z-10 hidden sm:flex items-center gap-3 rounded-lg bg-[#0a0a0a]/80 backdrop-blur-md px-2.5 py-1 text-[10px] text-[#9ca3af] border border-white/5">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-[#c4a962]"></span>
          <span>Parada Oficial (1-5)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-[#0d3d47] border border-[#c4a962]"></span>
          <span>Casa de los Pájaros</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-1 w-4 bg-[#c4a962]"></span>
          <span>Traza Qhapaq Ñan</span>
        </div>
      </div>
    </div>
  );
};
