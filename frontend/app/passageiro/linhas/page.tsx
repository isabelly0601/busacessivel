"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StopSelection from '../components/StopSelection';
import LineSelection from '../components/LineSelection';
import BottomNav from '../../components/BottomNav';

type AppStep = 'stop_selection' | 'line_selection' | 'confirm_boarding';

export default function LinhasPage() {
  const router = useRouter();
  const [step, setStep] = useState<AppStep>('stop_selection');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [selectedLine, setSelectedLine] = useState('');
  
  // Dados Reais da API
  const [realStops, setRealStops] = useState<any[]>([]);

  const falar = useCallback((texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  }, []);

  const vibrar = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
  }, []);

  // Obter Localizacao do GPS
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, []);

  // Buscar pontos na API do Banco de Dados real
  useEffect(() => {
    async function fetchStops() {
      // Se nao tem GPS ainda, usa o centro de BH como fallback para buscar no banco
      const lat = userLocation?.lat || -19.916681;
      const lng = userLocation?.lng || -43.934493;

      try {
        const res = await fetch(`/api/transit/pontos/proximos?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.pontos) {
            setRealStops(data.pontos);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar pontos do banco:", err);
      }
    }
    
    // Busca na primeira vez, e sempre que a localização mudar (podemos colocar um debounce se necessário, mas para o MVP está bom)
    fetchStops();
  }, [userLocation]);

  const handleSelectStop = (stop: any) => {
    setSelectedStop(stop);
    setStep('line_selection');
  };

  const handleSelectLine = (line: string) => {
    setSelectedLine(line);
    setStep('confirm_boarding');
  };

  const handleConfirmBoarding = async () => {
    falar(`Enviando solicitação de parada para a linha ${selectedLine}...`);
    
    try {
      await fetch('/api/boarding/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoLinhaDesejada: selectedLine })
      });
      alert(`Parada solicitada para a linha ${selectedLine}! O motorista foi notificado e já aparece no painel dele.`);
    } catch (e) {
      alert(`Falha ao conectar com o servidor, mas tentamos solicitar a linha ${selectedLine}.`);
    }

    router.push(`/passageiro/navegacao?linha=${selectedLine}`);
  };

  return (
    <main className="flex flex-col min-h-[100dvh] bg-[#000] text-white p-6 pb-24 font-sans">
      <div className="flex justify-between items-center mb-6 pt-4">
        <span className="text-[14px] text-[#FFCC00] font-black uppercase tracking-[0.2em]">Vai de Ônibus</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        {step === 'stop_selection' && (
          <StopSelection 
            stops={realStops} 
            userLocation={userLocation} 
            onSelect={handleSelectStop} 
            falar={falar} 
            vibrar={vibrar} 
          />
        )}

        {step === 'line_selection' && (
          <LineSelection 
            selectedStop={selectedStop} 
            onSelect={handleSelectLine} 
            falar={falar} 
            vibrar={vibrar} 
          />
        )}

        {step === 'confirm_boarding' && (
          <div className="flex flex-col gap-6 animate-in zoom-in duration-300">
            <h2 className="text-[#FFCC00] font-black text-3xl uppercase text-center">Confirme sua solicitação</h2>
            <div className="bg-[#111] p-8 rounded-[3rem] border-[6px] border-[#333] text-center">
              <p className="text-xl font-bold text-gray-400">Embarque no ponto:</p>
              <p className="text-2xl font-black text-white mt-2 leading-tight">{selectedStop?.nomeDescricao}</p>
              
              <div className="w-full h-1 bg-[#333] my-6 rounded-full" />
              
              <p className="text-xl font-bold text-gray-400">Pegar o ônibus:</p>
              <div className="bg-[#FFCC00] text-black w-32 h-32 rounded-3xl mx-auto flex items-center justify-center mt-4 border-4 border-black shadow-[0_0_20px_rgba(255,204,0,0.4)]">
                <p className="text-6xl font-black">{selectedLine}</p>
              </div>
            </div>

            <button 
              onClick={handleConfirmBoarding}
              className="w-full bg-green-500 py-10 rounded-[3rem] text-black font-black text-4xl uppercase shadow-[0_0_40px_rgba(34,197,94,0.6)] active:scale-95 transition-transform"
            >
              ✅ SOLICITAR EMBARQUE
            </button>
            <button 
              onClick={() => { setStep('line_selection'); falar('Cancelado. Escolha outra linha.'); }}
              className="w-full bg-transparent border-[4px] border-red-500 py-6 rounded-[2.5rem] text-red-500 font-black text-2xl uppercase active:bg-red-900/40"
            >
              Cancelar e Voltar
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
