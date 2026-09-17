"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { Settings, Volume2, Type, Eye, Save, LogOut } from 'lucide-react';

export default function ConfigPage() {
  const router = useRouter();
  const [vozAtiva, setVozAtiva] = useState(true);
  const [altoContraste, setAltoContraste] = useState(true);
  const [tamanhoFonte, setTamanhoFonte] = useState('Grande');

  const falar = (texto: string) => {
    if (vozAtiva && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  const handleSave = () => {
    falar("Configurações salvas com sucesso!");
    alert("Configurações salvas!");
  };

  return (
    <main className="flex flex-col min-h-[100dvh] bg-[#000] text-white p-6 pb-24 font-sans animate-in fade-in duration-300">
      <div className="flex items-center gap-4 pt-4 mb-8">
        <Settings size={36} color="#FFCC00" />
        <h1 className="text-3xl font-black text-[#FFCC00] uppercase tracking-wider">Acessibilidade</h1>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {/* Leitura de Tela (Voz) */}
        <div className="bg-[#111] border-[4px] border-[#333] p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Volume2 size={32} color={vozAtiva ? "#FFCC00" : "#666"} />
              <h2 className="text-2xl font-bold">Assistente de Voz</h2>
            </div>
            <button
              onClick={() => {
                setVozAtiva(!vozAtiva);
                if (!vozAtiva) falar("Assistente de voz ativado.");
              }}
              className={`w-20 h-10 rounded-full flex items-center p-1 transition-colors ${vozAtiva ? 'bg-[#FFCC00]' : 'bg-[#333]'}`}
              aria-label="Alternar assistente de voz"
            >
              <div className={`w-8 h-8 rounded-full transition-transform ${vozAtiva ? 'bg-black translate-x-10' : 'bg-gray-400 translate-x-0'}`} />
            </button>
          </div>
          <p className="text-gray-400 text-lg">O aplicativo falará em voz alta os avisos e botões da tela.</p>
        </div>

        {/* Alto Contraste */}
        <div className="bg-[#111] border-[4px] border-[#333] p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Eye size={32} color={altoContraste ? "#FFCC00" : "#666"} />
              <h2 className="text-2xl font-bold">Alto Contraste</h2>
            </div>
            <button
              onClick={() => setAltoContraste(!altoContraste)}
              className={`w-20 h-10 rounded-full flex items-center p-1 transition-colors ${altoContraste ? 'bg-[#FFCC00]' : 'bg-[#333]'}`}
            >
              <div className={`w-8 h-8 rounded-full transition-transform ${altoContraste ? 'bg-black translate-x-10' : 'bg-gray-400 translate-x-0'}`} />
            </button>
          </div>
          <p className="text-gray-400 text-lg">Modo escuro com botões amarelos focados na máxima legibilidade (Padrão).</p>
        </div>

        {/* Tamanho da Fonte */}
        <div className="bg-[#111] border-[4px] border-[#333] p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <Type size={32} color="#FFCC00" />
            <h2 className="text-2xl font-bold">Tamanho da Fonte</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['Normal', 'Grande', 'Gigante'].map((size) => (
              <button
                key={size}
                onClick={() => setTamanhoFonte(size)}
                className={`py-4 rounded-2xl font-bold text-xl border-[4px] transition-all ${
                  tamanhoFonte === size 
                  ? 'bg-[#FFCC00] text-black border-[#FFCC00]' 
                  : 'bg-[#222] text-white border-[#333]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Botoes Finais */}
        <div className="mt-auto flex flex-col gap-4 pt-8">
          <button 
            onClick={handleSave}
            className="w-full bg-[#FFCC00] text-black font-black text-2xl py-6 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <Save size={28} /> SALVAR PREFERÊNCIAS
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-transparent border-[4px] border-red-500 text-red-500 font-bold text-xl py-4 rounded-3xl flex items-center justify-center gap-3 active:bg-red-900/40"
          >
            <LogOut size={24} /> SAIR DA CONTA
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
