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
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newAlertFlash, setNewAlertFlash] = useState(false);

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

  // ── GPS ──
  useEffect(() => {
    if (!isDriving) return;
    // Simulação de GPS caso o browser bloqueie
    setGpsReady(true);
    setDriverLocation({ lat: -19.9167, lng: -43.9345 }); // BH centro

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsReady(true);
      },
      () => {
        // GPS bloqueado, mantém simulado
        setGpsReady(true);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [isDriving]);

  // ── Alerts Polling (a cada 3s para resposta mais rápida) ──
  useEffect(() => {
    if (!isDriving || !lineCode) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/telemetry/alertas?linha=${encodeURIComponent(lineCode)}&lat=${driverLocation?.lat ?? 0}&lng=${driverLocation?.lng ?? 0}`
        );
        if (res.ok) {
          const { solicitacoes } = await res.json();
          const lista = solicitacoes || [];
          setAlerts(lista);

          // Novo alerta detectado!
          if (lista.length > lastAlertsCount.current) {
            // Flash visual
            setNewAlertFlash(true);
            setTimeout(() => setNewAlertFlash(false), 2000);

            // Vibração no celular
            if ('vibrate' in navigator) navigator.vibrate([400, 200, 400, 200, 400]);

            // Voz
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              const msg = new SpeechSynthesisUtterance(
                `Atenção! Novo passageiro acessível aguardando no próximo ponto da linha ${lineCode}.`
              );
              msg.lang = 'pt-BR';
              msg.rate = 0.95;
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(msg);
            }
          }
          lastAlertsCount.current = lista.length;
        }
      } catch (err) {
        console.error('Erro ao buscar alertas:', err);
      }
    };

    fetchAlerts(); // imediato
    const iv = setInterval(fetchAlerts, 3000); // polling a cada 3s
    return () => clearInterval(iv);
  }, [isDriving, lineCode, driverLocation]);

  const handleNotifyArrival = async (solicitacaoId: string) => {
    const res = await fetch(`${API_BASE}/telemetry/notificar/${solicitacaoId}`, {
      method: 'PATCH'
    });
    if (res.ok) {
      setAlerts((prev: any[]) => prev.filter((a: any) => a.id !== solicitacaoId));
      lastAlertsCount.current = Math.max(0, lastAlertsCount.current - 1);
    }
  };

  const handleStartRoute = () => {
    if (lineCode.trim()) {
      setIsDriving(true);
      localStorage.setItem('driver_line', lineCode);
      localStorage.setItem('driver_is_driving', 'true');
    }
  };

  const handleLogout = () => {
    setIsDriving(false);
    setAlerts([]);
    lastAlertsCount.current = 0;
    localStorage.removeItem('driver_is_driving');
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
      newAlertFlash={newAlertFlash}
      onLogout={handleLogout}
      onNotify={handleNotifyArrival}
    />
  );
}
