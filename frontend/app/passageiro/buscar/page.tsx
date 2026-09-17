"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, Search, Mic } from 'lucide-react';
import { useState } from 'react';

export default function BuscarPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  const sugestoes = [
    { nome: 'Centro' },
    { nome: 'Terminal' },
    { nome: 'Hospital' },
    { nome: 'Escola' },
    { nome: 'Shopping' },
  ];

  const handleSelect = (nome: string) => {
    falar(`Selecionado: ${nome}`);
    router.push(`/passageiro/linha/302`); // Mock redirecionamento
  };

  return (
    <main className="min-h-dvh flex flex-col p-6 bg-[#000] text-white">
      {/* HEADER */}
      <header className="flex justify-between items-center pt-8 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { falar('Voltar'); router.back(); }}
            className="active:opacity-50 transition-opacity"
            aria-label="Voltar"
          >
            <ArrowLeft color="#fff" size={28} />
          </button>
          <h1 className="text-xl font-bold">Buscar linha ou destino</h1>
        </div>
        <button 
          onClick={() => falar('Tela de busca. Digite o número da linha ou nome do destino. Ou escolha uma sugestão abaixo.')}
          className="active:opacity-50 transition-opacity"
          aria-label="Ouvir instruções"
        >
          <Volume2 color="#fff" size={28} />
        </button>
      </header>

      {/* SEARCH INPUT */}
      <div className="relative mt-4 mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search color="#9ca3af" size={20} />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: 302, Centro, Hospital"
          className="w-full bg-[#111] border-2 border-[#333] text-white placeholder-gray-400 py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFCC00] focus:outline-none transition-colors font-bold"
        />
      </div>

      {/* SUGESTÕES */}
      <div className="flex-1">
        <h2 className="text-[#FFCC00] font-black uppercase tracking-wider mb-4">Sugestões</h2>
        <div className="flex flex-col gap-3">
          {sugestoes.map((item, index) => (
            <div 
              key={index} 
              onClick={() => handleSelect(item.nome)}
              className="flex justify-between items-center bg-[#111] border border-[#222] p-4 rounded-2xl active:border-[#FFCC00] cursor-pointer transition-colors"
            >
              <span className="font-bold text-lg">{item.nome}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); falar(item.nome); }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#222] active:bg-[#333]"
                aria-label={`Ouvir ${item.nome}`}
              >
                <Volume2 color="#fff" size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <div className="pt-6 pb-2">
        <button 
          onClick={() => router.push('/passageiro/voz')}
          className="w-full bg-transparent border-2 border-[#FFCC00] text-[#FFCC00] font-black text-xl py-4 rounded-full flex justify-center items-center gap-3 active:bg-[#FFCC00] active:text-black transition-colors"
        >
          <Mic size={24} /> Buscar por voz
        </button>
      </div>

    </main>
  );
}
