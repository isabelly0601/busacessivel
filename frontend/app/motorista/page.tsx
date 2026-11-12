"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import MotoristaDashboard, { AlertaSolicitacao } from './components/MotoristaDashboard';

const API_BASE = '/api';

export default function MotoristaPage() {
  const [lineCode, setLineCode] = useState('8106');
  const [vehicleNumber, setVehicleNumber] = useState('32018');
  const [isDriving, setIsDriving] = useState(true);
  const [alerts, setAlerts] = useState<AlertaSolicitacao[]>([]);
  const [gpsReady, setGpsReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newAlertFlash, setNewAlertFlash] = useState(false);

  const lastAlertsCount = useRef(0);

  // ── Persistência de Sessão Local ──
  useEffect(() => {
    const savedLine = localStorage.getItem('driver_line');
    const savedVehicle = localStorage.getItem('driver_vehicle');
    const savedIsDriving = localStorage.getItem('driver_is_driving');
    
    if (savedLine) setLineCode(savedLine);
    if (savedVehicle) setVehicleNumber(savedVehicle);
    if (savedIsDriving !== null) {
      setIsDriving(savedIsDriving === 'true');
    }
  }, []);

  // ── Monitoramento e Simulação de GPS ──
  useEffect(() => {
    // Coordenadas centrais de BH (Av. Afonso Pena / Av. Amazonas)
    setGpsReady(true);
    setDriverLocation({ lat: -19.9167, lng: -43.9345 });

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsReady(true);
        },
        () => {
          // GPS simulado caso permissão bloqueada
          setGpsReady(true);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, []);

  // ── Polling de Alertas de Telemetria (a cada 3s) ──
  useEffect(() => {
    if (!isDriving || !lineCode) return;

    const fetchAlerts = async () => {
      try {
        const lat = driverLocation?.lat ?? -19.9167;
        const lng = driverLocation?.lng ?? -43.9345;
        const res = await fetch(
          `${API_BASE}/telemetry/alertas?linha=${encodeURIComponent(lineCode)}&lat=${lat}&lng=${lng}`
        );

        if (res.ok) {
          const { solicitacoes } = await res.json();
          const lista: AlertaSolicitacao[] = solicitacoes || [];
          setAlerts(lista);

          // Novo alerta detectado!
          if (lista.length > lastAlertsCount.current) {
            setNewAlertFlash(true);
            setTimeout(() => setNewAlertFlash(false), 2000);

            if ('vibrate' in navigator) {
              navigator.vibrate([400, 200, 400, 200, 400]);
            }

            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              const msg = new SpeechSynthesisUtterance(
                `Atenção motorista! Solicitação de embarque para passageiro com deficiência visual na linha ${lineCode}.`
              );
              msg.lang = 'pt-BR';
              msg.rate = 1.0;
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(msg);
            }
          }
          lastAlertsCount.current = lista.length;
        }
      } catch (err) {
        // Silencioso em fallback
      }
    };

    fetchAlerts();
    const iv = setInterval(fetchAlerts, 3000);
    return () => clearInterval(iv);
  }, [isDriving, lineCode, driverLocation]);

  // ── Notificar Chegada ao Passageiro ──
  const handleNotifyArrival = async (solicitacaoId: string) => {
    try {
      const res = await fetch(`${API_BASE}/telemetry/notificar/${solicitacaoId}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== solicitacaoId));
        lastAlertsCount.current = Math.max(0, lastAlertsCount.current - 1);
      }
    } catch (err) {
      console.error('Erro ao notificar no backend:', err);
    }
  };

  const handleStartTrip = () => {
    setIsDriving(true);
    localStorage.setItem('driver_is_driving', 'true');
    localStorage.setItem('driver_line', lineCode);
  };

  const handleEndTrip = () => {
    setIsDriving(false);
    localStorage.setItem('driver_is_driving', 'false');
  };

  const handleSetLineCode = (code: string) => {
    setLineCode(code);
    localStorage.setItem('driver_line', code);
  };

  const handleSetVehicleNumber = (num: string) => {
    setVehicleNumber(num);
    localStorage.setItem('driver_vehicle', num);
  };

  return (
    <MotoristaDashboard
      lineCode={lineCode}
      setLineCode={handleSetLineCode}
      vehicleNumber={vehicleNumber}
      setVehicleNumber={handleSetVehicleNumber}
      gpsReady={gpsReady}
      alerts={alerts}
      driverLocation={driverLocation}
      newAlertFlash={newAlertFlash}
      isDriving={isDriving}
      onStartTrip={handleStartTrip}
      onEndTrip={handleEndTrip}
      onNotify={handleNotifyArrival}
    />
  );
}
