"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type AppStep = 'welcome' | 'listening' | 'confirmed' | 'approaching' | 'arrived';

export default function Passageiro() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [linha, setLinha] = useState('');
  const [transcript, setTranscript] = useState('');
  const [busDistance, setBusDistance] = useState<number>(0);
  const [gpsReady, setGpsReady] = useState(false);

  const busTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Audio Engine ──
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const beep = useCallback((freq: number, shape: OscillatorType, ms: number) => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = shape;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  }, [getAudioCtx]);

  const falar = useCallback((texto: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }, []);

  // ── GPS ──
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      () => { if(!gpsReady){setGpsReady(true);} },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [gpsReady]);

  // ── Welcome ──
  useEffect(() => {
    falar('Ponto MB. Toque em qualquer lugar da tela para começar.');
  }, [falar]);

  // ── Approaching beep ──
  useEffect(() => {
    if (step !== 'approaching' || busDistance <= 0) return;
    const delay = Math.max(150, (busDistance / 500) * 1500);
    const iv = setInterval(() => beep(900, 'square', 120), delay);
    return () => clearInterval(iv);
  }, [step, busDistance, beep]);

  // ── Arrived ──
  useEffect(() => {
    if (step === 'approaching' && busDistance <= 0) {
      setStep('arrived');
      falar(`O ônibus da linha ${linha} chegou no ponto. Prepare-se para embarcar.`);
      beep(500, 'sine', 600);
    }
  }, [step, busDistance, linha, falar, beep]);

  // ── Voice Recognition ──
  const startListening = () => {
    getAudioCtx(); // unlock
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      falar('Seu navegador não suporta reconhecimento de voz.');
      return;
    }
    setStep('listening');
    setTranscript('');
    beep(440, 'sine', 200);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'pt-BR';
    r.continuous = false;
    r.interimResults = true;

    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
      if (e.results[0].isFinal) {
        processVoice(t.toLowerCase());
      }
    };
    r.onerror = () => {
      setStep('welcome');
      falar('Não foi possível capturar sua voz. Toque na tela novamente.');
    };
    r.onend = () => {
      if (step === 'listening') setStep('welcome');
    };
    r.start();
    falar('Diga o nome ou número do ônibus.');
  };

  const processVoice = async (cmd: string) => {
    const cleaned = cmd.replace(/quero (pegar|ir|embarcar)( n[oa])?|gostaria de|por favor|linha|ônibus|onibus/gi, '').trim();
    setLinha(cleaned || cmd);
    falar(`Enviando solicitação para a linha ${cleaned || cmd}.`);

    try {
      const res = await fetch('http://localhost:3001/chamados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ponto: 'Ponto GPS Atual', linha: cleaned || cmd }),
      });
      if (res.ok) {
        setStep('confirmed');
        falar(`Pronto. O motorista da linha ${cleaned || cmd} foi alertado. Aguarde no ponto.`);

        // Simulate bus approaching after 3s
        setTimeout(() => {
          setStep('approaching');
          setBusDistance(500);
          falar('O ônibus está se aproximando. Fique atento ao sinal sonoro.');
          busTimerRef.current = setInterval(() => {
            setBusDistance((d) => {
              if (d <= 0) { clearInterval(busTimerRef.current!); return 0; }
              return d - 50;
            });
          }, 2000);
        }, 3000);
      } else {
        setStep('welcome');
        falar('Erro no servidor. Toque para tentar de novo.');
      }
    } catch {
      setStep('welcome');
      falar('Sem internet. Toque para tentar de novo.');
    }
  };

  const reset = () => {
    if (busTimerRef.current) clearInterval(busTimerRef.current);
    setStep('welcome');
    setLinha('');
    setBusDistance(0);
    setTranscript('');
    falar('Ponto MB reiniciado. Toque na tela quando estiver pronto.');
  };

  // ── Step-based colors ──
  const bg: Record<AppStep, string> = {
    welcome: 'bg-[#0c1a33]',
    listening: 'bg-[#330c0c]',
    confirmed: 'bg-[#0c2e1a]',
    approaching: 'bg-[#0c2e1a]',
    arrived: 'bg-[#1a2e0c]',
  };

  const accent: Record<AppStep, string> = {
    welcome: 'bg-[#3b82f6]',
    listening: 'bg-[#ef4444]',
    confirmed: 'bg-[#22c55e]',
    approaching: 'bg-[#f59e0b]',
    arrived: 'bg-[#22c55e]',
  };

  const canTap = step === 'welcome';

  return (
    <main
      onClick={canTap ? startListening : undefined}
      className={`flex flex-col min-h-dvh transition-colors duration-700 ${bg[step]} ${canTap ? 'cursor-pointer' : ''} select-none`}
      role="application"
      aria-label="Assistente de embarque PontoMB"
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm font-bold uppercase tracking-widest text-white/50">PontoMB</p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${gpsReady ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
          <span className="text-xs font-semibold text-white/40 uppercase">{gpsReady ? 'GPS' : 'Sem GPS'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 py-12">

        {/* ── STEP: Welcome ── */}
        {step === 'welcome' && (
          <>
            <div className={`w-40 h-40 rounded-full ${accent.welcome} flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3)]`}>
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-1h8M12 4a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-center leading-tight">
              Toque na tela
            </h1>
            <p className="text-2xl text-white/60 font-semibold text-center max-w-sm">
              e diga o número ou nome do ônibus que deseja pegar
            </p>
          </>
        )}

        {/* ── STEP: Listening ── */}
        {step === 'listening' && (
          <>
            <div className="relative flex items-center justify-center">
              <div className={`absolute w-48 h-48 rounded-full ${accent.listening} opacity-30 animate-sonar`} />
              <div className={`w-40 h-40 rounded-full ${accent.listening} flex items-center justify-center z-10 shadow-[0_0_60px_rgba(239,68,68,0.4)]`}>
                <svg className="w-20 h-20 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM6 10a1 1 0 00-2 0 8 8 0 0016 0 1 1 0 00-2 0 6 6 0 01-12 0zm5 9.93A8 8 0 013.07 12H1.05A10 10 0 0011 19.93V23h2v-3.07A10 10 0 0022.95 12h-2.02A8 8 0 0113 19.93z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-center text-[#ef4444]">
              Ouvindo...
            </h1>
            {transcript && (
              <p className="text-2xl text-white/80 font-semibold text-center bg-white/5 px-8 py-4 rounded-2xl border border-white/10 max-w-md">
                "{transcript}"
              </p>
            )}
          </>
        )}

        {/* ── STEP: Confirmed ── */}
        {step === 'confirmed' && (
          <>
            <div className={`w-40 h-40 rounded-full ${accent.confirmed} flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.3)]`}>
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-center text-[#22c55e]">
              Motorista Alertado
            </h1>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-center">
              <p className="text-lg text-white/50 font-semibold uppercase tracking-wider mb-2">Linha solicitada</p>
              <p className="text-4xl font-black text-white">{linha}</p>
            </div>
            <p className="text-xl text-white/50 font-semibold text-center">
              Aguarde no ponto com segurança...
            </p>
          </>
        )}

        {/* ── STEP: Approaching ── */}
        {step === 'approaching' && (
          <>
            <div className={`w-40 h-40 rounded-full ${accent.approaching} flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.4)]`}>
              <span className="text-7xl">🚍</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-center text-[#f59e0b]">
              Ônibus se aproximando
            </h1>
            <div className="w-full max-w-sm">
              <div className="flex justify-between mb-3">
                <span className="text-lg font-bold text-white/50">Linha {linha}</span>
                <span className="text-lg font-black text-[#f59e0b]">{busDistance}m</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#22c55e] rounded-full transition-all duration-[2000ms] ease-linear"
                  style={{ width: `${Math.max(2, 100 - busDistance / 5)}%` }}
                />
              </div>
            </div>
            <p className="text-lg text-white/40 font-semibold text-center mt-4">
              O som ficará mais rápido conforme o ônibus se aproxima
            </p>
          </>
        )}

        {/* ── STEP: Arrived ── */}
        {step === 'arrived' && (
          <>
            <div className={`w-40 h-40 rounded-full ${accent.arrived} flex items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.5)]`}>
              <span className="text-7xl">🚪</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-center text-[#22c55e]">
              EMBARQUE!
            </h1>
            <p className="text-2xl text-white/60 font-semibold text-center max-w-sm">
              O ônibus <span className="text-white font-black">{linha}</span> está no ponto. Dirija-se à porta.
            </p>
          </>
        )}
      </div>

      {/* Bottom action */}
      {(step === 'confirmed' || step === 'approaching' || step === 'arrived') && (
        <div className="px-6 pb-8">
          <button
            onClick={reset}
            className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-xl font-bold uppercase tracking-wider active:bg-white/10 transition-colors"
          >
            {step === 'arrived' ? 'Nova viagem' : 'Cancelar'}
          </button>
        </div>
      )}
    </main>
  );
}
