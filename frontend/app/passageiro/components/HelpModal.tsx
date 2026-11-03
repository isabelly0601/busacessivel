"use client";

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, AlertTriangle, Volume2, X, Bell } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  falar: (texto: string) => void;
}

export default function HelpModal({ isOpen, onClose, userLocation, falar }: HelpModalProps) {
  const [alarmActive, setAlarmActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      falar("Menu de Ajuda e Emergência. Você pode ligar para um contato de confiança, enviar sua localização por WhatsApp ou acionar a sirene sonora.");
    } else {
      stopAlarm();
    }
  }, [isOpen]);

  const toggleAlarm = () => {
    if (alarmActive) {
      stopAlarm();
      falar("Sirene de emergência desativada.");
    } else {
      startAlarm();
      falar("Atenção! Sirene de emergência ligada!");
    }
  };

  const startAlarm = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      // Efeito de sirene alternando frequências
      const now = ctx.currentTime;
      for (let i = 0; i < 30; i++) {
        osc.frequency.linearRampToValueAtTime(1100, now + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(700, now + i * 0.8 + 0.8);
      }

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioCtx(ctx);
      setOscillator(osc);
      setAlarmActive(true);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    } catch (e) {
      console.error("Erro ao iniciar alarme:", e);
    }
  };

  const stopAlarm = () => {
    try {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      if (audioCtx) {
        audioCtx.close();
      }
    } catch {}
    setOscillator(null);
    setAudioCtx(null);
    setAlarmActive(false);
  };

  const handleShareWhatsApp = () => {
    const locStr = userLocation 
      ? `Estou nesta localização: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : "Não foi possível obter coordenadas GPS no momento.";
    const text = encodeURIComponent(`Olá! Sou deficiente visual e estou utilizando o aplicativo Vai de Ônibus. Preciso de auxílio. ${locStr}`);
    falar("Abrindo WhatsApp para enviar sua localização para contato de ajuda.");
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCallEmergency = (phone: string, name: string) => {
    falar(`Ligando para ${name}`);
    window.location.href = `tel:${phone}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-end sm:justify-center p-4 sm:p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Janela de Ajuda e Emergência"
    >
      <div className="bg-[#111] border-[6px] border-red-500 rounded-[2.5rem] p-6 max-w-lg mx-auto w-full shadow-[0_0_60px_rgba(239,68,68,0.5)]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
              <AlertTriangle color="#fff" size={28} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Ajuda & SOS</h2>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-[#222] border-2 border-gray-600 rounded-full flex items-center justify-center active:bg-red-700 transition-colors"
            aria-label="Fechar janela de ajuda"
          >
            <X color="#fff" size={32} />
          </button>
        </div>

        <p className="text-gray-300 font-bold text-lg mb-6 leading-relaxed">
          Toque em uma das opções abaixo para solicitar auxílio imediatamente:
        </p>

        <div className="flex flex-col gap-4">
          
          {/* BOTÃO LIGAR CONTATO / FAMILIAR */}
          <button
            onClick={() => handleCallEmergency("190", "Central de Emergência 190")}
            className="w-full bg-[#FFCC00] text-black font-black text-2xl py-5 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform border-4 border-black shadow-lg"
            aria-label="Ligar para emergência ou central 190"
          >
            <Phone size={32} strokeWidth={3} />
            <span>LIGAR EMERGÊNCIA (190)</span>
          </button>

          {/* BOTÃO ENVIAR LOCALIZAÇÃO VIA WHATSAPP */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#25D366] text-black font-black text-2xl py-5 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform border-4 border-black shadow-lg"
            aria-label="Enviar localização GPS e pedido de ajuda pelo WhatsApp"
          >
            <MessageCircle size={32} strokeWidth={3} />
            <span>ENVIAR LOCALIZAÇÃO GPS</span>
          </button>

          {/* SIRENE DE ALARME SONORO LOCAL */}
          <button
            onClick={toggleAlarm}
            className={`w-full font-black text-2xl py-5 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-all border-4 shadow-lg ${
              alarmActive 
                ? 'bg-red-600 text-white border-white animate-bounce' 
                : 'bg-transparent text-red-400 border-red-500 hover:bg-red-950'
            }`}
            aria-label={alarmActive ? "Desativar sirene sonora de alerta" : "Ativar sirene sonora alta para chamar atenção na rua"}
          >
            <Bell size={32} strokeWidth={3} className={alarmActive ? "animate-spin" : ""} />
            <span>{alarmActive ? "PARAR SIRENE SONORA" : "TOCAR SIRENE DE ALERTA"}</span>
          </button>

          {/* BOTÃO FECHAR */}
          <button
            onClick={onClose}
            className="w-full bg-[#222] text-gray-300 font-black text-xl py-4 rounded-2xl border-2 border-[#444] mt-2 active:bg-[#333]"
            aria-label="Cancelar e voltar à tela inicial"
          >
            Voltar ao Aplicativo
          </button>

        </div>

      </div>
    </div>
  );
}
