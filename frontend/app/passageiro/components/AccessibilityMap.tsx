"use client";

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

interface MapProps {
  userLocation: { lat: number; lng: number } | null;
  targetLocation: { lat: number; lng: number } | null;
  onArrived?: () => void;
  falar: (texto: string) => void;
}

function calcBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x = Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) - Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function bearingToText(bearing: number): string {
  if (bearing < 45 || bearing >= 315) return 'Continue para o norte';
  if (bearing >= 45 && bearing < 135) return 'Vire à direita';
  if (bearing >= 135 && bearing < 225) return 'Continue para trás';
  return 'Vire à esquerda';
}

export default function AccessibilityMap({ userLocation, targetLocation, onArrived, falar }: MapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);
  const targetMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const lastDistRef = useRef<number | null>(null);
  const [distText, setDistText] = useState('');
  const [dirText, setDirText] = useState('');

  // Inicializa mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !L) return;
    mapRef.current = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([0, 0], 17);
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(mapRef.current);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // Atualiza posição
  useEffect(() => {
    if (!mapRef.current || !userLocation || !L) return;
    const ll = [userLocation.lat, userLocation.lng] as [number, number];

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(ll, {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.8)"></div>',
          iconSize: [20, 20], iconAnchor: [10, 10],
        }),
      }).addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLatLng(ll);
    }
    mapRef.current.panTo(ll, { animate: true, duration: 0.5 });

    if (targetLocation) {
      const tll = [targetLocation.lat, targetLocation.lng] as [number, number];
      if (!targetMarkerRef.current) {
        targetMarkerRef.current = L.marker(tll, {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:28px;height:28px;background:#ef4444;border-radius:50% 50% 50% 0;border:3px solid white;transform:rotate(-45deg);box-shadow:0 0 10px rgba(0,0,0,0.5)"></div>',
            iconSize: [28, 28], iconAnchor: [14, 28],
          }),
        }).addTo(mapRef.current);
      }
      if (lineRef.current) mapRef.current.removeLayer(lineRef.current);
      lineRef.current = L.polyline([ll, tll], { color: '#FFCC00', weight: 6, dashArray: '10,6' }).addTo(mapRef.current);

      const dist = Math.round(L.latLng(userLocation).distanceTo(L.latLng(targetLocation)));
      setDistText(dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`);

      const bearing = calcBearing(userLocation, targetLocation);
      const dir = bearingToText(bearing);
      setDirText(dir);

      const last = lastDistRef.current;
      const shouldSpeak = last === null ||
        (last > 50 && dist <= 50) || (last > 20 && dist <= 20) ||
        (last > 5 && dist <= 5) || Math.abs(last - dist) >= 25;

      if (shouldSpeak) {
        if (dist <= 5) {
          falar('Você chegou ao ponto de ônibus!');
          if (onArrived) onArrived();
        } else if (dist <= 20) {
          falar(`Quase lá! ${dist} metros. ${dir}.`);
        } else {
          falar(`${dir}. ${dist} metros até o ponto.`);
        }
        lastDistRef.current = dist;
      }
    }
  }, [userLocation, targetLocation, falar, onArrived]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-8 border-[#FFCC00] shadow-[0_0_30px_rgba(255,204,0,0.3)]" style={{ height: '45vh' }}>
      <div ref={containerRef} className="w-full h-full" />
      {dirText && (
        <div className="absolute top-3 left-3 right-3 z-[1000] bg-black/90 border-2 border-[#FFCC00] px-4 py-3 rounded-xl flex items-center gap-3 pointer-events-none">
          <span className="text-2xl">🧭</span>
          <span className="text-[#FFCC00] font-black text-xl">{dirText}</span>
        </div>
      )}
      {distText && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-black/80 px-3 py-2 rounded-xl pointer-events-none">
          <span className="text-white font-black text-lg">📍 {distText}</span>
        </div>
      )}
    </div>
  );
}
