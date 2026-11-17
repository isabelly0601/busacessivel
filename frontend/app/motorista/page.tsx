"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import RouteSetup from './components/RouteSetup';
import MotoristaDashboard from './components/MotoristaDashboard';

const API_BASE = '/api';

export default function Motorista() {
  const [lineCode, setLineCode] = useState('');
  const [isDriving, setIsDriving] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [gpsReady, setGpsReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastAlertsCount = useRef(0);

  useEffect(() => {
    const savedLine = localStorage.getItem('driver_line');
    const savedIsDriving = localStorage.getItem('driver_is_driving') === 'true';
    if (savedLine && savedIsDriving) {
      setLineCode(savedLine);
      setIsDriving(true);
    }
  }, []);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
  }, []);

  const playBeep = useCallback(() => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.5);
    osc.connect(gain).connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.5);
  }, []);

  useEffect(() => {
    if (!isDriving) return;
    setGpsReady(true);
    setDriverLocation({ lat: -19.9167, lng: -43.9345 });

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsReady(true);
      },
      () => {
        setGpsReady(true);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [isDriving]);

  useEffect(() => {
    if (!isDriving || !lineCode) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/telemetry/alertas?linha=${encodeURIComponent(lineCode)}&lat=${driverLocation?.lat ?? -19.9167}&lng=${driverLocation?.lng ?? -43.9345}`
        );
        if (res.ok) {
          const { solicitacoes } = await res.json();
          const lista = solicitacoes || [];
          setAlerts(lista);
          if (lista.length > lastAlertsCount.current) {
            playBeep();
          }
          lastAlertsCount.current = lista.length;
        }
      } catch (err) {
        console.error('Erro ao buscar alertas:', err);
      }
    };

    fetchAlerts();
    const iv = setInterval(fetchAlerts, 3000);
    return () => clearInterval(iv);
  }, [isDriving, driverLocation, lineCode, playBeep]);

  const handleNotifyArrival = async (solicitacaoId: string) => {
    const res = await fetch(`${API_BASE}/telemetry/notificar/${solicitacaoId}`, {
      method: 'PATCH'
    });
    if (res.ok) {
      setAlerts((prev) => prev.filter((a) => a.id !== solicitacaoId));
    }
  };

  return isDriving ? (
    <MotoristaDashboard
      lineCode={lineCode}
      gpsReady={gpsReady}
      alerts={alerts}
      driverLocation={driverLocation}
      onLogout={() => {
        setIsDriving(false);
        localStorage.removeItem('driver_is_driving');
      }}
      onNotify={handleNotifyArrival}
    />
  ) : (
    <RouteSetup
      lineCode={lineCode}
      setLineCode={setLineCode}
      onStart={() => {
        if (lineCode.trim()) {
          setIsDriving(true);
          localStorage.setItem('driver_line', lineCode);
          localStorage.setItem('driver_is_driving', 'true');
          initAudio();
        }
      }}
    />
  );
}
