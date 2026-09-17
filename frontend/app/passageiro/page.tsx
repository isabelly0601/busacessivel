"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, Volume2, Hand, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import dynamic from 'next/dynamic';
const AccessibilityMap = dynamic(() => import('./components/AccessibilityMap'), { ssr: false });
import ObstacleDetector from './components/ObstacleDetector';

type ToastType = { id: string; linha: string; status: 'loading' | 'success' | 'error'; msg: string };

export default function PassageiroHome() {
  const router = useRouter();
  const [gpsReady, setGpsReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [solicitados, setSolicitados] = useState<Set<string>>(new Set());

  const falar = useCallback((texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  }, []);

  const vibrar = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (!gpsReady) setGpsReady(true);
        },
        () => setGpsReady(false),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, [gpsReady]);

  const addToast = (t: ToastType) => {
    setToasts(prev => [...prev.filter(x => x.id !== t.id), t]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  };

  const onibusStr = "51,61,63,64,83D,5106,9502,30,411C,1502,2580,2590,2950,8151,9801,2101,9209,901,9407,4988,302,301,303,304,305,101,102,103,201,202,203";
  const proximosOnibus = onibusStr.split(',').map((linha, i) => ({
    linha: linha.trim(),
    rota: i % 2 === 0 ? 'Sentido Centro' : 'Sentido Bairro',
    tempo: `${(i % 12) + 2} min`
  }));

  const handleSolicitar = async (e: React.MouseEvent, linha: string) => {
    e.stopPropagation();

    const toastId = `toast-${linha}`;

    // Feedback imediato: loading
    addToast({ id: toastId, linha, status: 'loading', msg: `Enviando solicitação para linha ${linha}...` });
    falar(`Solicitando embarque na linha ${linha}`);

    try {
      const pontoDescricao = gpsReady && userLocation
        ? `Ponto próximo ao GPS (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
        : 'Ponto próximo (GPS indisponível)';

      const res = await fetch('/api/boarding/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoLinhaDesejada: linha,
          nomePassageiro: 'Passageiro PCD',
          pontoDescricao,
        })
      });

      if (res.ok) {
        setSolicitados(prev => new Set(prev).add(linha));
        vibrar([200, 100, 200, 100, 200]);
        falar(`Ônibus linha ${linha} solicitado! O motorista foi avisado. Aguarde no ponto.`);
        addToast({ id: toastId, linha, status: 'success', msg: `✅ Linha ${linha} solicitada! Motorista avisado.` });
        setTimeout(() => removeToast(toastId), 5000);
      } else {
        const error = await res.json();
        falar(`Erro ao solicitar a linha ${linha}.`);
        addToast({ id: toastId, linha, status: 'error', msg: `❌ Erro: ${error.error || 'Falha ao solicitar'}` });
        setTimeout(() => removeToast(toastId), 4000);
      }
    } catch {
      falar(`Erro de conexão ao solicitar linha ${linha}.`);
      addToast({ id: toastId, linha, status: 'error', msg: '❌ Erro de conexão com o servidor.' });
      setTimeout(() => removeToast(toastId), 4000);
    }
  };

  return (
    <main className="flex flex-col min-h-[100dvh] bg-[#000] text-white p-6 pb-24 relative">

      {/* TOASTS — Feedback visual das solicitações */}
      <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-2xl pointer-events-auto transition-all duration-300 ${
              toast.status === 'loading' ? 'bg-[#222] border-[#FFCC00] text-white' :
              toast.status === 'success' ? 'bg-green-950 border-green-500 text-green-300' :
              'bg-red-950 border-red-500 text-red-300'
            }`}
          >
            {toast.status === 'loading' && <Loader2 size={20} className="animate-spin text-[#FFCC00] shrink-0" />}
            {toast.status === 'success' && <CheckCircle size={20} className="text-green-400 shrink-0" />}
            {toast.status === 'error' && <XCircle size={20} className="text-red-400 shrink-0" />}
            <span className="font-bold text-sm flex-1">{toast.msg}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white font-black text-lg leading-none"
            >×</button>
          </div>
        ))}
      </div>

      {/* GPS Status */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] text-[#FFCC00] font-black uppercase tracking-[0.2em]">Vai de Ônibus</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${gpsReady ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-[10px] text-gray-400 font-bold uppercase">{gpsReady ? 'GPS Ativo' : 'Buscando GPS'}</span>
        </div>
      </div>

      <header className="flex justify-between items-start pt-4 pb-4">
        <div>
          <h1 className="text-4xl font-black text-[#FFCC00] tracking-tight">Câmera e Mapa</h1>
        </div>
        <button
          onClick={() => falar('Câmera de obstáculos e Mapa ativados. Abaixo, a lista de ônibus próximos para solicitação.')}
          className="w-12 h-12 bg-[#FFCC00] rounded-full flex items-center justify-center border-4 border-[#333] active:scale-90 transition-transform"
          aria-label="Ouvir instruções"
        >
          <Volume2 color="#000" size={24} strokeWidth={3} />
        </button>
      </header>

      {/* CÂMERA E MAPA */}
      <section className="flex flex-col gap-4 mb-6">
        <ObstacleDetector falar={falar} vibrar={vibrar} active={true} />
        <AccessibilityMap
          userLocation={userLocation}
          targetLocation={userLocation ? { lat: userLocation.lat + 0.001, lng: userLocation.lng + 0.001 } : null}
          falar={falar}
        />
      </section>

      {/* PRÓXIMOS ÔNIBUS */}
      <section className="mt-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#FFCC00] font-black text-xl uppercase tracking-wider">Ônibus e Solicitação</h2>
          <Bus color="#FFCC00" size={24} />
        </div>

        <div className="flex flex-col gap-4">
          {proximosOnibus.map((onibus, index) => {
            const jaSolicitado = solicitados.has(onibus.linha);
            return (
              <div
                key={index}
                onClick={() => router.push(`/passageiro/linha/${onibus.linha}`)}
                className={`flex flex-col p-4 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 ${
                  jaSolicitado
                    ? 'bg-green-950 border-green-500'
                    : 'bg-[#111] border-[#333] active:border-[#FFCC00]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-4 shadow-lg transition-colors ${
                      jaSolicitado ? 'bg-green-500 border-green-700' : 'bg-[#FFCC00] border-black shadow-[0_0_15px_rgba(255,204,0,0.2)]'
                    }`}>
                      {jaSolicitado
                        ? <CheckCircle color="#fff" size={28} />
                        : <span className="text-black font-black text-xl">{onibus.linha}</span>
                      }
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white">{onibus.rota}</p>
                      <p className="text-sm font-semibold text-gray-400">
                        {jaSolicitado ? '✅ Motorista avisado!' : `Chega em ${onibus.tempo}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); falar(`Linha ${onibus.linha}. Chega em ${onibus.tempo}.`); }}
                    className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center active:bg-[#333]"
                    aria-label={`Ouvir informações da linha ${onibus.linha}`}
                  >
                    <Volume2 color="#fff" size={20} />
                  </button>
                </div>

                <button
                  onClick={(e) => handleSolicitar(e, onibus.linha)}
                  disabled={jaSolicitado}
                  className={`w-full font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    jaSolicitado
                      ? 'bg-green-800 text-green-200 cursor-default opacity-80'
                      : 'bg-[#FFCC00] text-black'
                  }`}
                  aria-label={`Solicitar parada para linha ${onibus.linha}`}
                >
                  {jaSolicitado
                    ? <><CheckCircle size={20} /> Solicitado!</>
                    : <><Hand size={20} /> Solicitar Embarque</>
                  }
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
