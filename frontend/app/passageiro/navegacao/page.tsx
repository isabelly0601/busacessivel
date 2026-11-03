"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Volume2, Square, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import HelpModal from '../components/HelpModal';

const AccessibilityMap = dynamic(() => import('../components/AccessibilityMap'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-[#111] animate-pulse rounded-2xl flex items-center justify-center border-4 border-[#FFCC00]">Carregando mapa...</div>
});

const ObstacleDetector = dynamic(() => import('../components/ObstacleDetector'), {
  ssr: false
});

export default function NavegacaoPage() {
  const router = useRouter();
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const targetLoc = { lat: -19.916681, lng: -43.934493 }; // Exemplo: Ponto de Ônibus Central
  const locRef = useRef(userLoc);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  const vibrar = (ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  };

  useEffect(() => {
    falar('Navegação até o ponto iniciada. Siga as orientações sonoras e mantenha o celular apontado para frente.');
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(coords);
          locRef.current = coords;
        },
        (err) => console.error("Erro GPS:", err),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <main 
      className="min-h-dvh flex flex-col p-4 sm:p-6 bg-[#000] text-white"
      role="main"
      aria-label="Tela de navegação guiada por voz até o ponto de ônibus"
    >
      {/* HEADER */}
      <header className="flex justify-between items-center pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { falar('Navegação cancelada. Voltando para o início.'); router.push('/passageiro'); }}
            className="w-12 h-12 rounded-full bg-[#111] border-2 border-gray-600 flex items-center justify-center active:opacity-50 transition-opacity"
            aria-label="Cancelar navegação e voltar ao início"
          >
            <X color="#fff" size={28} />
          </button>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Navegação Ativa</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÃO DE SOS NA NAVEGAÇÃO */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center border-2 border-white active:scale-95 transition-transform"
            aria-label="Ajuda e Emergência"
          >
            <ShieldAlert color="#fff" size={24} />
          </button>

          {/* BOTÃO OUVIR INSTRUÇÃO ATUAL */}
          <button 
            onClick={() => falar('Você está na tela de navegação guiada. O mapa geográfico e a câmera de obstáculos estão orientando cada passo até o ponto.')}
            className="w-12 h-12 rounded-full bg-[#FFCC00] flex items-center justify-center border-2 border-black active:scale-95 transition-transform"
            aria-label="Repetir instrução sonora"
          >
            <Volume2 color="#000" size={24} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* MAPA GEOGRÁFICO REAL */}
      <div className="flex-1 mt-1 mb-3 flex flex-col">
        <div className="text-center mb-2">
          <h2 className="text-[#FFCC00] font-black uppercase text-sm tracking-widest">Rota Acessível ao Ponto</h2>
          <p className="text-gray-300 font-bold text-xs">Orientação passo a passo em tempo real</p>
        </div>
        
        <div className="flex-1 min-h-[220px]">
          <AccessibilityMap 
            userLocation={userLoc}
            targetLocation={targetLoc}
            falar={falar}
          />
        </div>
      </div>

      {/* DETECTOR DE OBSTÁCULOS DA CÂMERA */}
      <div className="mb-3">
        <ObstacleDetector falar={falar} vibrar={vibrar} active={true} />
      </div>

      {/* INFORMAÇÕES DE ORIENTAÇÃO */}
      <div className="text-center mb-3 bg-[#111] border-2 border-yellow-500/40 p-4 rounded-2xl">
        <h3 className="text-[#FFCC00] font-black text-2xl mb-1">A caminho do ponto</h3>
        <p className="text-gray-300 font-bold text-sm">Siga as instruções de voz e mantenha o celular apontado para frente</p>
      </div>

      {/* BOTÃO DE PARAR NAVEGAÇÃO */}
      <div className="pt-1 pb-2">
        <button 
          onClick={() => { falar('Navegação finalizada.'); router.push('/passageiro'); }}
          className="w-full bg-transparent border-4 border-gray-600 text-gray-300 font-black text-xl py-4 rounded-full flex justify-center items-center gap-3 active:bg-gray-900 transition-colors"
          aria-label="Finalizar e parar navegação"
        >
          <Square fill="#d1d5db" size={20} /> Parar Navegação
        </button>
      </div>

      {/* MODAL DE SOS */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        userLocation={userLoc}
        falar={falar}
      />
    </main>
  );
}
