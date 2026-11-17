"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Volume2, Square } from 'lucide-react';
import dynamic from 'next/dynamic';

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
  const targetLoc = { lat: -19.916681, lng: -43.934493 }; // Coordenada de exemplo: Praça Sete BH
  const locRef = useRef(userLoc);

  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(coords);
          locRef.current = coords;
        },
        (err) => console.error("Erro GPS:", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <main className="min-h-dvh flex flex-col p-6 bg-[#000] text-white">
      {/* HEADER */}
      <header className="flex justify-between items-center pt-8 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { falar('Navegação cancelada'); router.push('/passageiro'); }}
            className="active:opacity-50 transition-opacity"
            aria-label="Cancelar navegação"
          >
            <X color="#fff" size={32} />
          </button>
          <h1 className="text-xl font-bold">Navegação ativa</h1>
        </div>
        <button 
          onClick={() => falar('Tela de navegação. O mapa geográfico está ativo e monitorando seus passos.')}
          className="active:opacity-50 transition-opacity"
          aria-label="Ouvir instruções"
        >
          <Volume2 color="#fff" size={28} />
        </button>
      </header>

      {/* MAPA GEOGRÁFICO REAL */}
      <div className="flex-1 mt-4 mb-6 flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-[#FFCC00] font-black uppercase tracking-wider">Espaço Geográfico</h2>
          <p className="text-gray-400 font-semibold">Localização e Mapa em Tempo Real</p>
        </div>
        
        <div className="flex-1 min-h-[300px]">
          <AccessibilityMap 
            userLocation={userLoc}
            targetLocation={targetLoc}
            falar={falar}
          />
        </div>
      </div>

      {/* DETECTOR DE OBSTÁCULOS INVISÍVEL (Roda em background usando a câmera) */}
      <div className="hidden">
        <ObstacleDetector falar={falar} vibrar={() => {}} active={true} />
      </div>

      {/* BOTTOM INFO */}
      <div className="text-center mb-6">
        <h3 className="text-[#FFCC00] font-black text-2xl mb-1">A caminho do ponto</h3>
        <p className="text-gray-400 font-semibold">Siga as instruções de voz da rota</p>
      </div>

      {/* BOTTOM BUTTON */}
      <div className="pt-2 pb-2">
        <button 
          onClick={() => router.push('/passageiro')}
          className="w-full bg-transparent border-2 border-gray-600 text-gray-400 font-bold text-lg py-5 rounded-full flex justify-center items-center gap-3 active:bg-[#333] transition-colors"
        >
          <Square fill="#9ca3af" size={16} /> Parar navegação
        </button>
      </div>

    </main>
  );
}
