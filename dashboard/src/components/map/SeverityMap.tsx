"use client";
import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Rectangle,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cellBounds } from "@/lib/geo";
import { cellVisual } from "@/lib/cellVisual";
import type { Cell } from "@/lib/types";

const DEFAULT_CENTER: [number, number] = [-8.025, 110.332];

function FitToCells({ cells }: { cells: Cell[] }) {
  const map = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current || cells.length === 0) return;
    const pts: [number, number][] = [];
    for (const c of cells) {
      const b = cellBounds(c.cellId);
      pts.push([b.latLo, b.lngLo], [b.latHi, b.lngHi]);
    }
    map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 16 });
    didFit.current = true;
  }, [cells, map]);
  return null;
}

export default function SeverityMap({
  cells,
  selectedCellId,
  onSelectCell,
}: {
  cells: Cell[];
  selectedCellId: string | null;
  onSelectCell: (cell: Cell) => void;
}) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      zoomControl={false}
      className='h-full w-full'>
      <TileLayer
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; OpenStreetMap'
        className='cleanesia-tiles'
      />
      <ZoomControl position='bottomright' />
      <FitToCells cells={cells} />
      {cells.map((c) => {
        const b = cellBounds(c.cellId);
        const v = cellVisual(c.latestSeverity, c.latestReportAt);
        const selected = c.cellId === selectedCellId;
        return (
          <Rectangle
            key={c.cellId}
            bounds={[
              [b.latLo, b.lngLo],
              [b.latHi, b.lngHi],
            ]}
            pathOptions={{
              color: selected ? "#0f8a7e" : "rgba(0,0,0,0.26)",
              weight: selected ? 2.5 : 0.5,
              fillColor: v.fillColor,
              fillOpacity: v.fillOpacity,
            }}
            eventHandlers={{ click: () => onSelectCell(c) }}
          />
        );
      })}
    </MapContainer>
  );
}
