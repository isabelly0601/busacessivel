"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bus, Volume2, VolumeX, Hand, CheckCircle, XCircle, Loader2, 
  Mic, Search, Radio,
  MapPin, ShieldAlert, Sparkles, X, ChevronDown, ChevronUp,
  Eye, Headphones
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import dynamic from 'next/dynamic';
import ObstacleDetector from './components/ObstacleDetector';
import HelpModal from './components/HelpModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import { TODAS_LINHAS_BH, LinhaBH } from '../../compartilhado/linhas-bh';

const AccessibilityMap = dynamic(() => import('./components/AccessibilityMap'), { ssr: false });

type ToastType = { id: string; linha: string; status: 'loading' | 'success' | 'error'; msg: string };

export default function PassageiroHome() {
  const router = useRouter();
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [solicitados, setSolicitados] = useState<Set<string>>(new Set());

  // Controle de Áudio (Silêncio / Mudo)
  const [audioAtivo, setAudioAtivo] = useState(true);

  // Modais de Acessibilidade
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSentido, setFiltroSentido] = useState<'TODOS' | 'Centro' | 'Bairro'>('TODOS');
  const busSectionRef = useRef<HTMLDivElement>(null);
  const hasSpokenWelcome = useRef(false);

  const falar = useCallback((texto: string) => {
    if (!audioAtivo) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }, [audioAtivo]);

  const toggleAudio = () => {
    if (audioAtivo) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAudioAtivo(false);
    } else {
      setAudioAtivo(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Voz do aplicativo ativada.');
        u.lang = 'pt-BR';
        window.speechSynthesis.speak(u);
      }
    }
  };

  const vibrar = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }, []);

  // Assistência de voz ativa logo na entrada do passageiro
  useEffect(() => {
    if (!hasSpokenWelcome.current) {
      hasSpokenWelcome.current = true;
      const timer = setTimeout(() => {
        vibrar([120, 60, 120]);
        falar('Bem-vindo ao BusAcessível! Assistente de voz pronto. Toque no botão azul central para dizer qual ônibus deseja pegar.');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [falar, vibrar]);

  // Solicitar e Monitorar GPS silenciosamente
  const requestGps = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsReady(true);
          setGpsError(false);
          vibrar([80]);
        },
        (err) => {
          console.warn("GPS aviso:", err);
          setGpsReady(false);
          setGpsError(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [vibrar]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsReady(true);
          setGpsError(false);
        },
        (err) => {
          if (err.code === 1) setGpsError(true);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, []);

  const addToast = (t: ToastType) => {
    setToasts(prev => [...prev.filter(x => x.id !== t.id), t]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  };

  // Catálogo com todas as linhas de BH
  const listaOnibusBase: LinhaBH[] = TODAS_LINHAS_BH;

  const onibusFiltrados = useMemo(() => {
    return listaOnibusBase.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchText = 
        !q ||
        item.linha.toLowerCase().includes(q) ||
        item.destino.toLowerCase().includes(q) ||
        (item.categoria && item.categoria.toLowerCase().includes(q));
      const matchSentido = filtroSentido === 'TODOS' || item.sentido === filtroSentido;
      return matchText && matchSentido;
    });
  }, [searchQuery, filtroSentido, listaOnibusBase]);

  // Ação de Solicitar Embarque em Tempo Real
  const handleSolicitar = async (e: React.MouseEvent, linha: string) => {
    e.stopPropagation();

    const toastId = `toast-${linha}`;
    addToast({ id: toastId, linha, status: 'loading', msg: `Enviando solicitação em tempo real para linha ${linha}...` });
    falar(`Solicitando parada para a linha ${linha}. Notificando motorista.`);

    try {
      const pontoDescricao = gpsReady && userLocation
        ? `Av. Amazonas próx. ao GPS (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
        : 'Ponto Av. Amazonas, 1730';

      const res = await fetch('/api/boarding/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoLinhaDesejada: linha,
          nomePassageiro: 'Passageiro PCD',
          pontoDescricao,
          latitudePassageiro: userLocation?.lat ?? -19.9167,
          longitudePassageiro: userLocation?.lng ?? -43.9345
        })
      });

      if (res.ok) {
        setSolicitados(prev => new Set(prev).add(linha));
        vibrar([300, 100, 300, 100, 300]);
        falar(`Confirmado! O motorista da linha ${linha} recebeu seu aviso em tempo real e irá parar.`);
        addToast({ id: toastId, linha, status: 'success', msg: `✅ Linha ${linha} solicitada! Motorista notificado.` });
        setTimeout(() => removeToast(toastId), 6000);
      } else {
        const error = await res.json();
        falar(`Erro ao solicitar a linha ${linha}. Tente novamente.`);
        addToast({ id: toastId, linha, status: 'error', msg: `❌ Erro: ${error.error || 'Falha ao solicitar'}` });
        setTimeout(() => removeToast(toastId), 4000);
      }
    } catch {
      falar(`Erro de conexão com o servidor.`);
      addToast({ id: toastId, linha, status: 'error', msg: '❌ Erro de conexão.' });
      setTimeout(() => removeToast(toastId), 4000);
    }
  };

  const handleEncontrarPonto = () => {
    falar('Iniciando orientação até o ponto de ônibus mais próximo.');
    vibrar([150, 50, 150]);
    router.push('/passageiro/navegacao');
  };

  const handleEncontrarOnibus = () => {
    falar('Localizando ônibus de Belo Horizonte. Use a barra de pesquisa ou a voz.');
    vibrar([100]);
    if (busSectionRef.current) {
      busSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    const input = document.getElementById('campo-pesquisa-linhas');
    if (input) input.focus();
  };

  const handleReconhecerAmbiente = () => {
    setShowCamera(prev => !prev);
    const novo = !showCamera;
    falar(novo ? 'Câmera ativada para detecção de obstáculos.' : 'Câmera desativada.');
    vibrar([150]);
  };

  const handleOuvirOrientacoes = () => {
    const statusGPS = gpsReady ? 'GPS ativo e calibrado.' : 'Aguardando sinal GPS.';
    falar(`Orientações do trajeto: ${statusGPS} Fale com o assistente a qualquer momento ou toque no botão vermelho para SOS.`);
    vibrar([100, 50, 100]);
  };

  return (
    <main 
      className="flex flex-col min-h-[100dvh] bg-[#070a0f] text-white p-4 sm:p-6 pb-28 relative font-sans"
      role="main"
      aria-label="Assistente de transporte público por voz BusAcessível"
    >
      {/* TOASTS DE NOTIFICAÇÃO AUDÍVEIS E VISUAIS */}
      <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="assertive">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-4 shadow-2xl pointer-events-auto transition-all duration-300 ${
              toast.status === 'loading' ? 'bg-[#0f2b3e] border-[#00e6a8] text-white' :
              toast.status === 'success' ? 'bg-green-950 border-green-500 text-green-200' :
              'bg-red-950 border-red-500 text-red-200'
            }`}
          >
            {toast.status === 'loading' && <Loader2 size={24} className="animate-spin text-[#00e6a8] shrink-0" />}
            {toast.status === 'success' && <CheckCircle size={24} className="text-green-400 shrink-0" />}
            {toast.status === 'error' && <XCircle size={24} className="text-red-400 shrink-0" />}
            <span className="font-black text-base flex-1">{toast.msg}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white font-black text-2xl leading-none p-1"
              aria-label="Fechar aviso"
            >×</button>
          </div>
        ))}
      </div>

      {/* CONTAINER PRINCIPAL DO ASSISTENTE POR VOZ */}
      <div className="bg-[#0b131e] border-2 border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl mb-5">
        
        {/* HEADER LIMPO E ACESSÍVEL */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-black text-[#00e6a8] tracking-tight">BusAcessível</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mt-0.5">
              Passageiro Autônomo
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* STATUS GPS */}
            <button
              onClick={requestGps}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                gpsReady 
                  ? 'bg-green-950/60 border-green-500/50 text-green-300' 
                  : gpsError
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300'
              }`}
              aria-label={gpsReady ? "GPS Ativo" : "Ativar GPS"}
            >
              <div className={`w-2 h-2 rounded-full ${gpsReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span>{gpsReady ? 'GPS Ativo' : 'Buscar GPS'}</span>
            </button>

            {/* BOTÃO SOS */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center border-2 border-white text-white active:scale-95 shadow-lg"
              aria-label="Ajuda e Emergência SOS"
            >
              <ShieldAlert size={20} />
            </button>

            {/* BOTÃO SILENCIAR / ATIVAR ÁUDIO */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-black transition-all ${
                audioAtivo 
                  ? 'bg-[#00e6a8] border-black text-black shadow-md' 
                  : 'bg-red-950/80 border-red-500 text-red-300'
              }`}
              aria-label={audioAtivo ? "Silenciar voz do aplicativo" : "Ativar voz do aplicativo"}
            >
              {audioAtivo ? <Volume2 size={18} strokeWidth={2.5} /> : <VolumeX size={18} strokeWidth={2.5} />}
              <span>{audioAtivo ? 'Voz Ativa' : 'Mudo'}</span>
            </button>
          </div>
        </div>

        {/* HERO CARD CENTRAL: ASSISTENTE DE VOZ PROMINENTE */}
        <div 
          onClick={() => setIsVoiceModalOpen(true)}
          className="bg-gradient-to-b from-[#133c5e] to-[#0a2336] border-2 border-[#00e6a8] rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all shadow-[0_10px_35px_rgba(0,230,168,0.2)] mb-5 hover:border-white"
          role="button"
          tabIndex={0}
          aria-label="Falar com Assistente de Voz. Toque aqui para dizer para onde quer ir"
        >
          <div className="w-16 h-16 rounded-full bg-[#00e6a8] text-black flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(0,230,168,0.5)] animate-pulse">
            <Mic size={34} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            Falar com o Aplicativo
          </h2>

          <p className="text-sm sm:text-base font-semibold text-cyan-100 max-w-sm">
            Toque aqui e diga: &quot;Quero o 8106&quot; ou &quot;Onde fica o ponto?&quot;
          </p>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#033b32] text-[#00e6a8] border border-[#00e6a8]/60 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles size={14} /> Assistente de Voz Pronto
            </span>
          </div>
        </div>

        {/* AS 4 AÇÕES ESSENCIAIS LIMPAS (GRADE 2X2) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Ações essenciais do passageiro">
          
          {/* 1. ENCONTRAR PONTO */}
          <button
            onClick={handleEncontrarPonto}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Encontrar ponto. Orientação por áudio"
          >
            <div className="mb-1.5 text-[#00e6a8]">
              <MapPin size={28} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-sm text-white leading-tight">Encontrar ponto</span>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5">Orientação por áudio</span>
          </button>

          {/* 2. ENCONTRAR ÔNIBUS */}
          <button
            onClick={handleEncontrarOnibus}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Encontrar ônibus. Ver todas as linhas de BH"
          >
            <div className="mb-1.5 text-[#00e6a8]">
              <Bus size={28} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-sm text-white leading-tight">Linhas de BH</span>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5">Buscar por voz ou texto</span>
          </button>

          {/* 3. RECONHECER AMBIENTE */}
          <button
            onClick={handleReconhecerAmbiente}
            className={`flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border transition-all ${
              showCamera 
                ? 'bg-emerald-950/60 border-[#00e6a8]' 
                : 'bg-[#09111b] border-white/10 hover:bg-[#0d1826]'
            }`}
            aria-label="Câmera e detecção de obstáculos"
          >
            <div className="mb-1.5 text-[#00e6a8]">
              <Eye size={28} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-sm text-white leading-tight">
              {showCamera ? 'Câmera Aberta' : 'Câmera IA'}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5">Obstáculos e degraus</span>
          </button>

          {/* 4. OUVIR ORIENTAÇÕES */}
          <button
            onClick={handleOuvirOrientacoes}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Ouvir orientações da viagem"
          >
            <div className="mb-1.5 text-[#00e6a8]">
              <Headphones size={28} strokeWidth={2.2} />
            </div>
            <span className="font-bold text-sm text-white leading-tight">Orientações</span>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5">Instruções de viagem</span>
          </button>

        </div>

      </div>

      {/* CÂMERA DE DETECÇÃO (APENAS QUANDO ATIVADA) */}
      {showCamera && (
        <section className="flex flex-col gap-3 mb-5" aria-label="Reconhecimento visual">
          <div className="flex justify-between items-center px-1">
            <span className="text-[#00e6a8] font-black uppercase text-xs tracking-wider">👁️ Reconhecimento Ativo</span>
            <button
              onClick={() => setShowCamera(false)}
              className="text-xs font-bold bg-[#111] border border-gray-700 px-3 py-1 rounded-full text-gray-300"
            >
              Fechar Câmera
            </button>
          </div>
          <ObstacleDetector falar={falar} vibrar={vibrar} active={true} />
        </section>
      )}

      {/* SEÇÃO DE ÔNIBUS DE BH */}
      <section ref={busSectionRef} className="mt-1 flex-1" aria-label="Linhas de ônibus de Belo Horizonte">
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2">
            <Bus color="#00e6a8" size={22} />
            <h2 className="text-[#00e6a8] font-black text-lg uppercase tracking-wider">Linhas de Ônibus (BH)</h2>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-[#111] px-2.5 py-1 rounded-full border border-gray-800">
            {onibusFiltrados.length} linhas
          </span>
        </div>

        {/* CAMPO DE PESQUISA */}
        <div className="relative mb-3">
          <input
            id="campo-pesquisa-linhas"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número (ex: 8106, 51, 30) ou bairro..."
            className="w-full bg-[#111] border-2 border-gray-700 focus:border-[#00e6a8] text-white text-base font-bold py-3 pl-11 pr-11 rounded-2xl outline-none placeholder-gray-500"
            aria-label="Filtrar linhas de ônibus"
          />
          <Search size={20} color="#00e6a8" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); falar('Filtro removido.'); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Limpar filtro"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* FILTROS DE SENTIDO */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" role="radiogroup">
          {(['TODOS', 'Centro', 'Bairro'] as const).map(sentido => (
            <button
              key={sentido}
              onClick={() => {
                setFiltroSentido(sentido);
                falar(`Filtrado por ${sentido === 'TODOS' ? 'todos os sentidos' : `sentido ${sentido}`}`);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase border transition-all ${
                filtroSentido === sentido
                  ? 'bg-[#00e6a8] text-black border-[#00e6a8] font-black'
                  : 'bg-[#111] text-gray-300 border-gray-800'
              }`}
            >
              {sentido === 'TODOS' ? 'Todos os Sentidos' : `Sentido ${sentido}`}
            </button>
          ))}
        </div>

        {/* LISTA COMPLETA DE ÔNIBUS */}
        <div className="flex flex-col gap-3">
          {onibusFiltrados.slice(0, 30).map((onibus, index) => {
            const jaSolicitado = solicitados.has(onibus.linha);
            return (
              <div
                key={index}
                onClick={() => router.push(`/passageiro/linha/${onibus.linha}`)}
                className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  jaSolicitado
                    ? 'bg-green-950/80 border-green-500'
                    : 'bg-[#101722] border-white/5 active:border-[#00e6a8]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      jaSolicitado ? 'bg-green-500 text-white' : 'bg-[#00e6a8] text-black'
                    }`}>
                      {jaSolicitado ? <CheckCircle size={24} /> : onibus.linha}
                    </div>

                    <div>
                      <p className="font-bold text-sm text-white leading-snug">{onibus.destino}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {onibus.categoria && (
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md">
                            {onibus.categoria}
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#00e6a8]">
                          {jaSolicitado ? '✅ Notificado ao Motorista' : `${onibus.tempoMin} min (${onibus.distancia})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      falar(`Linha ${onibus.linha}, destino ${onibus.destino}. Previsão ${onibus.tempoMin} minutos.`);
                    }}
                    className="w-10 h-10 rounded-full bg-[#1b2636] flex items-center justify-center active:bg-[#25364e]"
                    aria-label={`Ouvir dados da linha ${onibus.linha}`}
                  >
                    <Volume2 size={18} color="#fff" />
                  </button>
                </div>

                <button
                  onClick={(e) => handleSolicitar(e, onibus.linha)}
                  disabled={jaSolicitado}
                  className={`w-full font-black text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    jaSolicitado
                      ? 'bg-green-800 text-green-100 cursor-default'
                      : 'bg-[#00e6a8] text-black active:scale-95 shadow-md'
                  }`}
                  aria-label={`Solicitar parada do ônibus ${onibus.linha}`}
                >
                  {jaSolicitado ? (
                    <><CheckCircle size={18} /> Embarque Notificado ao Motorista!</>
                  ) : (
                    <><Hand size={18} /> Solicitar Embarque em Tempo Real</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DO ASSISTENTE DE VOZ */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        falar={falar}
        vibrar={vibrar}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onFilterLine={(q) => setSearchQuery(q)}
      />

      {/* MODAL DE AJUDA & SOS */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        userLocation={userLocation}
        falar={falar}
      />

      <BottomNav />
    </main>
  );
}
