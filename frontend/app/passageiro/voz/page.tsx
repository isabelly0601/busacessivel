"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, ArrowLeft, Volume2, Sparkles } from 'lucide-react';

export default function VozPage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMsg, setResponseMsg] = useState('Toque no microfone e diga o que deseja.');
  const recognitionRef = useRef<any>(null);

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
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      falar('Reconhecimento de voz não suportado neste navegador. Use o Google Chrome.');
      setResponseMsg('Reconhecimento de voz não suportado.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        vibrar([100, 50, 100]);
        setResponseMsg('Ouvindo... Diga para onde quer ir ou qual linha deseja.');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          falar('Não consegui ouvir com clareza. Toque no botão e fale novamente.');
          setResponseMsg('Não compreendi. Toque no botão para falar de novo.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    // 1. Onde fica o ponto?
    if (
      text.includes('onde fica o ponto') ||
      text.includes('onde é o ponto') ||
      text.includes('como chego no ponto') ||
      text.includes('ponto de ônibus')
    ) {
      const resp = 'O ponto de ônibus mais próximo está a cerca de 35 metros em frente. Abrindo navegação guiada por voz.';
      setResponseMsg(resp);
      falar(resp);
      vibrar([200, 100, 200]);
      setTimeout(() => router.push('/passageiro/navegacao'), 3500);
      return;
    }

    // 2. Quero pegar o ônibus X / Linha X
    const matchLinha = text.match(/\b(\d{2,4}[a-zA-Z]?|\d{2,4})\b/);
    if (matchLinha || text.includes('ônibus') || text.includes('linha')) {
      const numeroLinha = matchLinha ? matchLinha[1].toUpperCase() : '';
      if (numeroLinha) {
        const resp = `Linha ${numeroLinha} identificada! Chegando em cerca de 4 minutos no seu ponto. Redirecionando para embarque.`;
        setResponseMsg(resp);
        falar(resp);
        vibrar([200, 100, 200]);
        setTimeout(() => router.push(`/passageiro/linha/${numeroLinha}`), 3500);
        return;
      }
    }

    // 3. Quero ir para o Centro / Hospital / Destino
    if (text.includes('centro') || text.includes('hospital') || text.includes('terminal')) {
      const resp = `Buscando linhas para o destino solicitado. As linhas 51, 61 e 302 atendem essa rota.`;
      setResponseMsg(resp);
      falar(resp);
      vibrar([200, 100, 200]);
      setTimeout(() => router.push('/passageiro/linhas'), 3500);
      return;
    }

    // 4. Ajuda
    if (text.includes('ajuda') || text.includes('socorro') || text.includes('emergência')) {
      const resp = 'Abrindo assistência de emergência na tela inicial.';
      setResponseMsg(resp);
      falar(resp);
      setTimeout(() => router.push('/passageiro'), 2500);
      return;
    }

    // Fallback
    const fallback = `Você disse: "${rawText}". Você pode pedir: "Quero pegar o ônibus 8106", "Onde fica o ponto?", ou "Quero ir para o centro".`;
    setResponseMsg(fallback);
    falar(fallback);
  };

  useEffect(() => {
    falar('Comando de voz ativado. Toque no botão grande de microfone e diga: Quero pegar o ônibus 8106, Onde fica o ponto, ou Quero ir para o centro.');
    startListening();
  }, []);

  return (
    <main className="min-h-dvh flex flex-col p-6 items-center justify-between bg-black text-white">
      {/* HEADER */}
      <header className="w-full flex justify-between items-center pt-4">
        <button 
          onClick={() => { falar('Voltar'); router.back(); }}
          className="w-14 h-14 bg-[#111] border-2 border-gray-700 rounded-full flex items-center justify-center active:bg-[#333]"
          aria-label="Voltar para a página anterior"
        >
          <ArrowLeft color="#FFCC00" size={28} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles color="#FFCC00" size={24} />
          <span className="text-[#FFCC00] font-black uppercase text-sm tracking-widest">IA por Voz</span>
        </div>
        <button 
          onClick={() => falar('Diga comandos como: Quero pegar o ônibus 8106, Onde fica o ponto, ou Quero ir para o hospital.')}
          className="w-14 h-14 bg-[#FFCC00] rounded-full flex items-center justify-center active:bg-[#E6B800]"
          aria-label="Ouvir exemplos de comandos de voz"
        >
          <Volume2 color="#000" size={28} strokeWidth={3} />
        </button>
      </header>

      {/* ÁREA CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center w-full my-6 text-center">
        <h1 className="text-3xl font-black text-white mb-8 uppercase tracking-wider">
          {isListening ? 'Ouvindo...' : 'Comando por Voz'}
        </h1>

        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-64 h-64 rounded-full flex items-center justify-center border-[14px] transition-all shadow-[0_0_80px_rgba(255,204,0,0.4)] ${
            isListening 
              ? 'bg-red-600 border-red-950 animate-pulse scale-105 shadow-[0_0_100px_rgba(239,68,68,0.8)]' 
              : 'bg-[#FFCC00] border-black active:scale-95'
          }`}
          aria-label={isListening ? "Gravando voz. Toque para parar" : "Tocar para falar agora"}
        >
          {isListening ? (
            <MicOff color="#fff" size={88} strokeWidth={2.5} />
          ) : (
            <Mic color="#000" size={88} strokeWidth={3} />
          )}
        </button>

        {transcript && (
          <div className="mt-8 bg-[#111] border-2 border-[#333] px-6 py-4 rounded-2xl max-w-sm">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Você falou:</p>
            <p className="text-white text-xl font-black italic">"{transcript}"</p>
          </div>
        )}

        <div className="mt-6 bg-[#1a1a00] border-4 border-[#FFCC00] p-6 rounded-3xl max-w-md w-full">
          <p className="text-white font-bold text-lg leading-snug">
            {responseMsg}
          </p>
        </div>
      </div>

      {/* EXEMPLOS NA PARTE INFERIOR */}
      <div className="w-full flex flex-col gap-2 pb-6 max-w-md">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Comandos suportados:</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-[#111] p-3 rounded-xl text-center text-sm font-bold text-gray-300 border border-[#222]">
            🗣️ "Quero pegar o ônibus 8106"
          </div>
          <div className="bg-[#111] p-3 rounded-xl text-center text-sm font-bold text-gray-300 border border-[#222]">
            🗣️ "Onde fica o ponto de ônibus?"
          </div>
          <div className="bg-[#111] p-3 rounded-xl text-center text-sm font-bold text-gray-300 border border-[#222]">
            🗣️ "Quero ir para o centro"
          </div>
        </div>
      </div>
    </main>
  );
}
