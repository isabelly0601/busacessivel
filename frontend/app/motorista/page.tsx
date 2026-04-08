"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import RouteSetup from './components/RouteSetup';
import MotoristaDashboard from './components/MotoristaDashboard';

const API_BASE = 'http://localhost:3001/api';

export default function Motorista() {
  const [lineCode, setLineCode] = useState('');
  const [isDriving, setIsDriving] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [gpsReady, setGpsReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastAlertsCount = useRef(0);

  // ── Session Persistence ──
  useEffect(() => {
    const savedLine = localStorage.getItem('driver_line');
    const savedIsDriving = localStorage.getItem('driver_is_driving') === 'true';
    if (savedLine && savedIsDriving) {
      setLineCode(savedLine);
      setIsDriving(true);
    }
  }, []);

  const startAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playAlertSound = useCallback(() => {
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

  // ── GPS ──
  useEffect(() => {
    if (!isDriving) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsReady(true);
      },
      () => setGpsReady(false),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [isDriving]);

  // ── Alerts Polling ──
  useEffect(() => {
    if (!isDriving || !driverLocation) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE}/telemetry/alertas?linha=${lineCode}&lat=${driverLocation.lat}&lng=${driverLocation.lng}`);
        if (res.ok) {
          const { solicitacoes } = await res.json();
          setAlerts(solicitacoes || []);
          if (solicitacoes.length > lastAlertsCount.current) {
            playAlertSound();
          }
          lastAlertsCount.current = solicitacoes.length;
        }
      } catch (err) {
        console.error('Erro ao buscar alertas:', err);
      }
    };

    fetchAlerts();
    const iv = setInterval(fetchAlerts, 5000);
    return () => clearInterval(iv);
  }, [isDriving, driverLocation, lineCode, playAlertSound]);

  const handleNotifyArrival = async (solicitacaoId: string) => {
    const res = await fetch(`${API_BASE}/telemetry/notificar/${solicitacaoId}`, {
      method: 'PATCH'
    });
    if (res.ok) {
      setAlerts((prev: any[]) => prev.filter((a: any) => a.id !== solicitacaoId));
    }
  };

  const handleStartRoute = () => {
    if (lineCode.trim()) {
      setIsDriving(true);
      localStorage.setItem('driver_line', lineCode);
      localStorage.setItem('driver_is_driving', 'true');
      startAudio();
    }
  };

  const handleLogout = () => {
    setIsDriving(false);
    localStorage.removeItem('driver_is_driving');
    // We keep the line code saved but set driving to false
  };

  if (!isDriving) {
    return <RouteSetup lineCode={lineCode} setLineCode={setLineCode} onStart={handleStartRoute} />;
  }

  return (
    <MotoristaDashboard 
      lineCode={lineCode}
      gpsReady={gpsReady}
      alerts={alerts}
      driverLocation={driverLocation}
      onLogout={handleLogout}
      onNotify={handleNotifyArrival}
    />
  );
}
