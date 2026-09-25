"use client";
import {
  MapContainer,
  TileLayer,
  Rectangle,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cellBounds } from "@/lib/geo";
import { cellVisual } from "@/lib/cellVisual";
import type { Report } from "@/lib/types";

export default function ReportLocationMap({ report }: { report: Report }) {
  const b = cellBounds(report.cellId);
  const v = cellVisual(report.severity, report.createdAt);
  return (
    <MapContainer
      center={[report.lat, report.lng]}
      zoom={16}
      zoomControl={false}
      scrollWheelZoom={false}
      className='h-full w-full'>
      <TileLayer
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; OpenStreetMap'
        className='cleanesia-tiles'
      />
      <Rectangle
        bounds={[
          [b.latLo, b.lngLo],
          [b.latHi, b.lngHi],
        ]}
        pathOptions={{
          color: "rgba(0,0,0,0.26)",
          weight: 0.5,
          fillColor: v.fillColor,
          fillOpacity: v.fillOpacity,
        }}
      />
      <CircleMarker
        center={[report.lat, report.lng]}
        radius={7}
        pathOptions={{
          color: "#0c2c2a",
          weight: 2,
          fillColor: "#0f8a7e",
          fillOpacity: 1,
        }}
      />
    </MapContainer>
  );
}
