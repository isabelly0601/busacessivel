"use client";

import { Volume2, AlertTriangle, Info, Bell } from 'lucide-react';

export default function AlertasPage() {
  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  const alertas = [
    {
      tipo: 'Atenção',
      mensagem: 'Mudança no itinerário da linha 205.',
      icon: <AlertTriangle color="#FFCC00" size={32} strokeWidth={3} />,
      textoFalar: 'Atenção. Mudança no itinerário da linha 205.'
    },
    {
      tipo: 'Informação',
      mensagem: 'Trânsito lento na região central.',
      icon: <Info color="#3b82f6" size={32} strokeWidth={3} />,
      textoFalar: 'Informação. Trânsito lento na região central.'
    },
    {
      tipo: 'Lembrete',
      mensagem: 'Sua consulta médica é às 14h.',
      icon: <Bell color="#FFCC00" size={32} strokeWidth={3} fill="#FFCC00" />,
      textoFalar: 'Lembrete. Sua consulta médica é às 14 horas.'
    }
  ];

  const ouvirTodos = () => {
    falar(alertas.map(a => a.textoFalar).join(' '));
  };

  return (
    <main className="min-h-dvh flex flex-col p-6 bg-[#000] text-white">
      {/* HEADER */}
      <header className="flex justify-between items-center pt-8 pb-4">
        <h1 className="text-2xl font-bold">Alertas</h1>
        <button 
          onClick={() => falar('Tela de alertas.')}
          className="active:opacity-50 transition-opacity"
          aria-label="Ouvir instruções"
        >
          <Volume2 color="#fff" size={28} />
        </button>
      </header>

      {/* LISTA DE ALERTAS */}
      <div className="flex-1 flex flex-col gap-4 mt-4">
        {alertas.map((alerta, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 bg-[#111] border border-[#222] p-5 rounded-2xl"
          >
            <div className="flex-shrink-0">
              {alerta.icon}
            </div>
            <div>
              <p className="font-bold text-white text-lg">{alerta.tipo}</p>
              <p className="text-gray-400 text-sm">{alerta.mensagem}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM BUTTON */}
      <div className="pt-6 pb-2">
        <button 
          onClick={ouvirTodos}
          className="w-full bg-transparent border-2 border-[#FFCC00] text-[#FFCC00] font-black text-xl py-4 rounded-full flex justify-center items-center gap-3 active:bg-[#FFCC00] active:text-black transition-colors"
        >
          <Volume2 size={24} /> Ouvir todos os alertas
        </button>
      </div>

    </main>
  );
}
