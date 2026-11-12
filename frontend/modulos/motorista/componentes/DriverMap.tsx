"use client";

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

interface DriverMapProps {
  driverLocation: { lat: number, lng: number } | null;
  alerts: any[];
}

export default function DriverMap({ driverLocation, alerts }: DriverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const passengerMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([0, 0], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !driverLocation) return;

    const latlng: L.LatLngExpression = [driverLocation.lat, driverLocation.lng];

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(latlng, {
        icon: L.divIcon({ 
          className: 'bg-blue-500 w-6 h-6 rounded-full border-4 border-white shadow-lg',
          iconSize: [24, 24]
        })
      }).addTo(mapRef.current);
    } else {
      driverMarkerRef.current.setLatLng(latlng);
    }

    mapRef.current.setView(latlng);
  }, [driverLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove markers not in alerts
    const currentIds = new Set(alerts.map(a => a.id));
    passengerMarkersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        passengerMarkersRef.current.delete(id);
      }
    });

    // Add/Update markers for alerts
    alerts.forEach(alert => {
      const lat = alert.latitudePassageiro;
      const lng = alert.longitudePassageiro;

      if (lat && lng) {
        const latlng: L.LatLngExpression = [Number(lat), Number(lng)];
        if (passengerMarkersRef.current.has(alert.id)) {
          passengerMarkersRef.current.get(alert.id)!.setLatLng(latlng);
        } else {
          const marker = L.marker(latlng, {
            icon: L.divIcon({ 
              className: 'bg-red-500 w-8 h-8 rounded-full border-4 border-white shadow-xl animate-bounce flex items-center justify-center text-white text-[10px] font-bold',
              html: 'PCD',
              iconSize: [32, 32]
            })
          }).addTo(mapRef.current!);
          passengerMarkersRef.current.set(alert.id, marker);
        }
      }
    });
  }, [alerts]);

  return (
    <div className="w-full h-full glass-panel overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
