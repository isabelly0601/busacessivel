"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, ArrowLeft, Volume2 } from 'lucide-react';

export default function VozPage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      falar('Reconhecimento de voz não suportado neste dispositivo.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      falar('Ouvindo... Diga para onde quer ir.');
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const t = event.results[current][0].transcript;
      setTranscript(t);
      falar(`Você disse: ${t}. Buscando rotas...`);
      setTimeout(() => {
        router.push('/passageiro/linhas');
      }, 3000);
    };

    recognition.onerror = () => {
      setIsListening(false);
      falar('Não consegui ouvir. Tente novamente.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    falar('Pesquisa por voz. Toque no botão gigante de microfone no centro da tela e diga seu destino.');
  }, []);

  return (
    <main className="min-h-dvh flex flex-col p-6 items-center justify-center bg-black text-white">
      <header className="absolute top-8 left-6 right-6 flex justify-between items-center">
        <button 
          onClick={() => { falar('Voltar'); router.back(); }}
          className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center active:bg-[#333]"
          aria-label="Voltar"
        >
          <ArrowLeft color="#FFCC00" size={24} />
        </button>
        <button 
          onClick={() => falar('Diga coisas como: Quero ir para o hospital. Ou: Buscar linha trezentos e dois.')}
          className="w-12 h-12 bg-[#FFCC00] rounded-full flex items-center justify-center active:bg-[#E6B800]"
          aria-label="Ajuda da Pesquisa por Voz"
        >
          <Volume2 color="#000" size={24} strokeWidth={3} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <h1 className="text-3xl font-black text-white mb-12 text-center uppercase tracking-wider">
          {isListening ? 'Ouvindo...' : 'Pesquisa por Voz'}
        </h1>

        <button
          onClick={startListening}
          className={`w-64 h-64 rounded-full flex items-center justify-center border-[12px] border-[#111] transition-all shadow-[0_0_60px_rgba(255,204,0,0.5)] ${
            isListening ? 'bg-red-600 animate-pulse border-red-900 shadow-red-900' : 'bg-[#FFCC00] active:scale-95'
          }`}
          aria-label={isListening ? "Gravando. Toque para cancelar" : "Tocar para falar"}
        >
          {isListening ? (
            <MicOff color="#fff" size={80} strokeWidth={2} />
          ) : (
            <Mic color="#000" size={80} strokeWidth={3} />
          )}
        </button>

        <p className="mt-12 text-2xl font-bold text-gray-400 text-center h-16">
          {transcript || 'Toque para falar'}
        </p>
      </div>
    </main>
  );
}
