"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2 } from 'lucide-react';

export default function SplashScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redireciona imediatamente para a tela do passageiro com o mapa e câmera
    router.push('/passageiro');
  }, [router]);

  const handleStart = () => {
    router.push('/passageiro');
  };

  if (!mounted) return null;

  return (
    <main 
      className="min-h-dvh flex flex-col items-center justify-between p-8"
      style={{ backgroundColor: '#FFCC00', color: '#000' }}
      onClick={handleStart}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
        
        {/* LOGO GIGANTE */}
        <div className="relative w-48 h-48 bg-transparent border-[12px] border-black rounded-full flex items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
            <circle cx="7" cy="18" r="2" />
            <path d="M9 18h5" />
            <circle cx="16" cy="18" r="2" />
          </svg>
          <div className="absolute -right-10 top-10">
            <Volume2 size={48} strokeWidth={3} />
          </div>
          {/* Balãozinho de fala na borda */}
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#FFCC00] border-l-[12px] border-b-[12px] border-black rotate-45 rounded-sm" />
        </div>

        <div className="text-center mt-6">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Vai de Ônibus</h1>
          <p className="text-xl font-bold opacity-80 leading-snug">
            Mobilidade acessível.<br />Autonomia para todos.
          </p>
        </div>

        {/* BRAILLE DECORATIVO (Simulação) */}
        <div className="flex gap-4 mt-12 opacity-40">
          <div className="grid grid-cols-2 gap-1"><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/></div>
          <div className="grid grid-cols-2 gap-1"><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 rounded-full"/></div>
          <div className="grid grid-cols-2 gap-1"><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 rounded-full"/></div>
          <div className="grid grid-cols-2 gap-1"><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 bg-black rounded-full"/><div className="w-2 h-2 rounded-full"/><div className="w-2 h-2 rounded-full"/></div>
        </div>

      </div>

      <button 
        className="bg-black text-white w-full max-w-sm py-5 rounded-full text-2xl font-black flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl"
        aria-label="Toque para começar"
      >
        <Volume2 size={32} /> Toque para começar
      </button>

    </main>
  );
}
