"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import AuthFlow from './components/AuthFlow';
import FaceIdScanner from './components/FaceIdScanner';
import StopSelection from './components/StopSelection';
import LineSelection from './components/LineSelection';
import BoardingStatus from './components/BoardingStatus';

const API_BASE = 'http://localhost:3001/api';

type AppStep = 
  | 'checking_auth' 
  | 'phone_input' 
  | 'otp_input' 
  | 'face_id'
  | 'stop_selection' 
  | 'line_selection' 
  | 'awaiting_arrival' 
  | 'approaching' 
  | 'arrived';

export default function Passageiro() {
  const [step, setStep] = useState<AppStep>('checking_auth');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [token, setToken] = useState('');
  
  const [nearbyStops, setNearbyStops] = useState<any[]>([]);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [selectedLine, setSelectedLine] = useState('');
  const [solicitacaoId, setSolicitacaoId] = useState('');
  
  const [gpsReady, setGpsReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Audio/Feedback ──
  const falar = useCallback((texto: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const vibrar = useCallback((ms: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  }, []);

  // ── Init & Auth ──
  useEffect(() => {
    let dId = localStorage.getItem('bus_device_id');
    if (!dId) {
      dId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('bus_device_id', dId);
    }
    setDeviceId(dId);

    const storedToken = localStorage.getItem('bus_token');
    if (storedToken) {
      setToken(storedToken);
      setStep('stop_selection');
      falar('Bem vindo de volta. Verificando pontos próximos.');
    } else {
      setStep('phone_input');
      falar('Bem vindo ao Bus Acessível. Digite seu número de telefone para começar.');
    }
  }, [falar]);

  // ── GPS ──
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!gpsReady) setGpsReady(true);
      },
      () => setGpsReady(false),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [gpsReady]);

  // ── Fetch Nearby Stops ──
  useEffect(() => {
    if (step === 'stop_selection' && userLocation) {
      fetch(`${API_BASE}/pontos/proximos?lat=${userLocation.lat}&lng=${userLocation.lng}`)
        .then(res => res.json())
        .then(data => {
          setNearbyStops(data);
          if (data.length > 0) {
            falar(`Encontrei ${data.length} pontos próximos. O primeiro é ${data[0].nomeDescricao}. Pressione para selecionar.`);
          }
        });
    }
  }, [step, userLocation, falar]);

  // ── Auth Handlers ──
  const handleRequestOtp = async () => {
    if (phone.length < 10) return falar('Número de telefone inválido.');
    vibrar(50);
    const res = await fetch(`${API_BASE}/auth/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone: phone }),
    });
    if (res.ok) {
      setStep('otp_input');
      falar('Código enviado. Digite os 6 dígitos recebidos.');
    }
  };

  const handleValidateOtp = async () => {
    const res = await fetch(`${API_BASE}/auth/validar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefone: phone, codigoOtp: otp, deviceId }),
    });
    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('bus_token', token);
      setToken(token);
      setStep('stop_selection');
      falar('Login realizado com sucesso.');
    } else {
      falar('Código inválido. Tente novamente.');
    }
  };

  // ── Boarding Flow ──
  const handleSelectStop = (stop: any) => {
    setSelectedStop(stop);
    setStep('line_selection');
    falar(`Ponto ${stop.nomeDescricao} selecionado. Agora diga ou escolha a linha.`);
  };

  const handleRequestBoarding = async (line: string) => {
    setSelectedLine(line);
    falar(`Solicitando embarque para a linha ${line}.`);
    
    const res = await fetch(`${API_BASE}/embarque/solicitar`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        pontoId: selectedStop.id, 
        codigoLinhaDesejada: line,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSolicitacaoId(data.id);
      setStep('awaiting_arrival');
      falar('Solicitação confirmada. Aguarde o aviso de aproximação.');
      startPolling(data.id);
    }
  };

  const startPolling = (id: string) => {
    pollIntervalRef.current = setInterval(async () => {
      const res = await fetch(`${API_BASE}/embarque/${id}/status`);
      const data = await res.json();
      if (data.status === 'onibus_notificado') {
        setStep('approaching');
        falar('O ônibus está se aproximando!');
        vibrar([500, 200, 500, 200, 1000]);
        clearInterval(pollIntervalRef.current!);
      }
    }, 5000);
  };

  const reset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setStep('stop_selection');
    setSelectedStop(null);
    setSelectedLine('');
    falar('Cancelado.');
  };

  return (
    <main className="flex flex-col min-h-dvh bg-[#0a0f1a] text-white p-6 gap-6 font-sans select-none overflow-hidden">
      
      {/* Header Accessibility Status */}
      <div className="flex justify-between items-center opacity-40">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bus Acessível [BETA]</span>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${gpsReady ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-[8px] font-black uppercase">{gpsReady ? 'GPS Ativo' : 'GPS'}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        {(step === 'phone_input' || step === 'otp_input') && (
          <AuthFlow 
            step={step} 
            phone={phone} setPhone={setPhone} 
            otp={otp} setOtp={setOtp} 
            onRequestOtp={handleRequestOtp} 
            onValidateOtp={handleValidateOtp} 
            onStartFaceId={() => {
              setStep('face_id');
              falar('Iniciando reconhecimento facial. Centralize seu rosto.');
            }}
          />
        )}

        {step === 'face_id' && (
          <FaceIdScanner onComplete={() => {
            falar('Face ID reconhecido.');
            vibrar(100);
            setTimeout(() => {
              setStep('stop_selection');
              falar('Selecione seu ponto de embarque.');
            }, 3000);
          }} />
        )}

        {step === 'stop_selection' && (
          <StopSelection stops={nearbyStops} onSelect={handleSelectStop} />
        )}

        {step === 'line_selection' && (
          <LineSelection selectedStop={selectedStop} onSelect={handleRequestBoarding} />
        )}

        {(step === 'awaiting_arrival' || step === 'approaching') && (
          <BoardingStatus 
            step={step} 
            line={selectedLine} 
            stopName={selectedStop.nomeDescricao} 
            solicitacaoId={solicitacaoId}
          />
        )}
      </div>

      {/* Reset/Cancel Button */}
      {(step === 'line_selection' || step === 'awaiting_arrival' || step === 'approaching') && (
        <button 
          onClick={reset}
          className="bg-red-900/20 border border-red-500/20 py-6 rounded-3xl text-red-500 font-black uppercase tracking-widest active:bg-red-900/40 transition-all"
        >
          Cancelar Viagem
        </button>
      )}
    </main>
  );
}
