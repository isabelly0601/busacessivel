"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, X, Volume2, Sparkles, Navigation, Bus, AlertCircle } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  falar: (texto: string) => void;
  vibrar: (ms: number | number[]) => void;
  onOpenHelp?: () => void;
  onFilterLine?: (query: string) => void;
}

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  falar,
  vibrar,
  onOpenHelp,
  onFilterLine,
}: VoiceAssistantModalProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setResponseMsg('Toque no botão e fale o que deseja...');
      falar('Assistente de voz ativado. Diga o que deseja, por exemplo: Quero pegar o ônibus 8106, Onde fica o ponto, ou Quero ir para o centro.');
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      falar('Reconhecimento de voz não é suportado neste navegador. Tente pelo Google Chrome.');
      setResponseMsg('Reconhecimento de voz não disponível.');
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
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          falar('Não consegui compreender. Toque no microfone e tente novamente.');
          setResponseMsg('Não entendi. Toque para tentar novamente.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
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

  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    // 1. Onde fica o ponto? / Navegação até o ponto
    if (
      text.includes('onde fica o ponto') ||
      text.includes('onde é o ponto') ||
      text.includes('achar o ponto') ||
      text.includes('encontrar o ponto') ||
      text.includes('como chego no ponto') ||
      text.includes('como chegar no ponto') ||
      text.includes('localizar ponto') ||
      text.includes('ponto de ônibus')
    ) {
      const resposta = 'O ponto de ônibus mais próximo está a cerca de 35 metros em frente. Iniciando navegação guiada por voz agora!';
      setResponseMsg(resposta);
      falar(resposta);
      vibrar([200, 100, 200]);
      setTimeout(() => {
        onClose();
        router.push('/passageiro/navegacao');
      }, 3500);
      return;
    }

    // 2. Pedido de Ajuda / SOS / Emergência
    if (
      text.includes('ajuda') ||
      text.includes('socorro') ||
      text.includes('emergência') ||
      text.includes('estou perdido') ||
      text.includes('preciso de ajuda')
    ) {
      const resposta = 'Abrindo menu de emergência e ajuda!';
      setResponseMsg(resposta);
      falar(resposta);
      vibrar([300, 100, 300, 100, 300]);
      setTimeout(() => {
        onClose();
        if (onOpenHelp) onOpenHelp();
      }, 1500);
      return;
    }

    // 3. Quero pegar o ônibus X / Linha X
    const matchLinha = text.match(/\b(\d{2,4}[a-zA-Z]?|\d{2,4})\b/);
    if (matchLinha || text.includes('ônibus') || text.includes('linha')) {
      const numeroLinha = matchLinha ? matchLinha[1].toUpperCase() : '';
      if (numeroLinha) {
        const resposta = `Linha ${numeroLinha} identificada! O ônibus chega em aproximadamente 4 minutos no seu ponto. Abrindo detalhes para embarque.`;
        setResponseMsg(resposta);
        falar(resposta);
        vibrar([200, 100, 200]);
        if (onFilterLine) onFilterLine(numeroLinha);
        setTimeout(() => {
          onClose();
          router.push(`/passageiro/linha/${numeroLinha}`);
        }, 3500);
        return;
      }
    }

    // 4. Quero ir para o Centro / Hospital / Destino
    if (text.includes('centro') || text.includes('hospital') || text.includes('terminal') || text.includes('estação') || text.includes('ir para')) {
      let destino = 'Centro';
      if (text.includes('hospital')) destino = 'Hospital';
      else if (text.includes('terminal')) destino = 'Terminal';
      else if (text.includes('estação')) destino = 'Estação';

      const resposta = `Buscando linhas para ${destino}. As linhas 51, 61 e 302 atendem essa região. Filtrando na lista de ônibus.`;
      setResponseMsg(resposta);
      falar(resposta);
      vibrar([200, 100, 200]);
      if (onFilterLine) onFilterLine(destino);
      setTimeout(() => {
        onClose();
      }, 3500);
      return;
    }

    // 5. Fallback inteligente
    const respostaPadrao = `Você disse: "${rawText}". Você pode pedir: "Quero pegar o ônibus 8106", "Onde fica o ponto?", ou "Quero ir para o centro".`;
    setResponseMsg(respostaPadrao);
    falar(respostaPadrao);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 backdrop-blur-lg"
      role="dialog"
      aria-modal="true"
      aria-label="Assistente de Voz Inteligente"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
          <Sparkles color="#FFCC00" size={32} />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Assistente por Voz</h2>
        </div>
        <button
          onClick={onClose}
          className="w-14 h-14 bg-[#222] border-2 border-gray-600 rounded-full flex items-center justify-center active:bg-gray-800"
          aria-label="Fechar assistente de voz"
        >
          <X color="#fff" size={32} />
        </button>
      </div>

      {/* ÁREA CENTRAL INTERATIVA */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
        
        {/* BOTÃO GIGANTE DE MICROFONE */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-64 h-64 rounded-full flex items-center justify-center border-[14px] transition-all shadow-[0_0_80px_rgba(255,204,0,0.5)] ${
            isListening 
              ? 'bg-red-600 border-red-950 animate-pulse scale-105 shadow-[0_0_100px_rgba(239,68,68,0.8)]' 
              : 'bg-[#FFCC00] border-black active:scale-95'
          }`}
          aria-label={isListening ? "Gravando sua fala. Toque para parar" : "Toque para falar agora"}
        >
          {isListening ? (
            <MicOff color="#fff" size={90} strokeWidth={2.5} />
          ) : (
            <Mic color="#000" size={90} strokeWidth={3} />
          )}
        </button>

        <p className="mt-8 text-2xl font-black text-[#FFCC00] uppercase tracking-wide">
          {isListening ? '🎙️ Ouvindo você...' : 'Toque no microfone para falar'}
        </p>

        {transcript && (
          <div className="mt-4 bg-[#111] border-2 border-[#333] px-6 py-4 rounded-2xl max-w-md">
            <p className="text-gray-400 text-sm font-bold uppercase mb-1">Você falou:</p>
            <p className="text-white text-xl font-black italic">"{transcript}"</p>
          </div>
        )}

        <div className="mt-6 bg-[#1a1a00] border-4 border-[#FFCC00] p-6 rounded-3xl max-w-md w-full">
          <p className="text-white font-bold text-lg leading-snug">
            {responseMsg}
          </p>
        </div>

      </div>

      {/* EXEMPLOS RÁPIDOS DE COMANDOS */}
      <div className="flex flex-col gap-2 pb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Exemplos que você pode falar:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button 
            onClick={() => processVoiceCommand("Quero pegar o ônibus 8106")}
            className="bg-[#111] border-2 border-[#333] p-3 rounded-xl text-left text-sm font-bold text-gray-300 active:border-[#FFCC00]"
          >
            🚌 "Quero pegar o 8106"
          </button>
          <button 
            onClick={() => processVoiceCommand("Onde fica o ponto de ônibus")}
            className="bg-[#111] border-2 border-[#333] p-3 rounded-xl text-left text-sm font-bold text-gray-300 active:border-[#FFCC00]"
          >
            🧭 "Onde fica o ponto?"
          </button>
          <button 
            onClick={() => processVoiceCommand("Quero ir para o centro")}
            className="bg-[#111] border-2 border-[#333] p-3 rounded-xl text-left text-sm font-bold text-gray-300 active:border-[#FFCC00]"
          >
            🏙️ "Quero ir para o centro"
          </button>
        </div>
      </div>

    </div>
  );
}
