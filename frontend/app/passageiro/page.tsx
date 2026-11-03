"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bus, Volume2, Hand, CheckCircle, XCircle, Loader2, 
  Mic, Navigation, AlertTriangle, Search, Radio, Compass,
  MapPin, ShieldAlert, Sparkles, X, ChevronDown, ChevronUp,
  Eye, Headphones
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import dynamic from 'next/dynamic';
import ObstacleDetector from './components/ObstacleDetector';
import HelpModal from './components/HelpModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';

const AccessibilityMap = dynamic(() => import('./components/AccessibilityMap'), { ssr: false });

type ToastType = { id: string; linha: string; status: 'loading' | 'success' | 'error'; msg: string };

interface OnibusItem {
  linha: string;
  destino: string;
  sentido: 'Centro' | 'Bairro';
  tempoMin: number;
  distancia: string;
  isRealtime: boolean;
}

export default function PassageiroHome() {
  const router = useRouter();
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [solicitados, setSolicitados] = useState<Set<string>>(new Set());

  // Modais de Acessibilidade
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSentido, setFiltroSentido] = useState<'TODOS' | 'Centro' | 'Bairro'>('TODOS');
  const busSectionRef = useRef<HTMLDivElement>(null);

  const falar = useCallback((texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const vibrar = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }, []);

  // Solicitar e Monitorar GPS com feedback sonoro
  const requestGps = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      falar('Solicitando localização GPS...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsReady(true);
          setGpsError(false);
          falar('Localização GPS obtida com sucesso.');
          vibrar([100, 50, 100]);
        },
        (err) => {
          console.error("Erro GPS:", err);
          setGpsReady(false);
          setGpsError(true);
          falar('Atenção: Ative o GPS nas configurações do seu aparelho.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      falar('Geolocalização não suportada neste dispositivo.');
    }
  }, [falar, vibrar]);

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

  // Linhas de ônibus com distinção transparente entre Tempo Real e Previsto
  const listaOnibusBase: OnibusItem[] = [
    { linha: '8106', destino: 'Belo Vale / Centro', sentido: 'Centro', tempoMin: 3, distancia: '450m', isRealtime: true },
    { linha: '302',  destino: 'Estação Barreiro / Centro', sentido: 'Centro', tempoMin: 5, distancia: '780m', isRealtime: true },
    { linha: '51',   destino: 'Estação Pampulha / Centro', sentido: 'Centro', tempoMin: 7, distancia: '1.2 km', isRealtime: true },
    { linha: '61',   destino: 'Estação Venda Nova / Bairro', sentido: 'Bairro', tempoMin: 10, distancia: '1.8 km', isRealtime: true },
    { linha: '83D',  destino: 'Estação São Gabriel / Centro Direta', sentido: 'Centro', tempoMin: 13, distancia: '2.5 km', isRealtime: false },
    { linha: '9502', destino: 'São Geraldo / Bairro Madre Gertrudes', sentido: 'Bairro', tempoMin: 16, distancia: '3.1 km', isRealtime: false },
    { linha: '411C', destino: 'Terminal São Benedito / Centro', sentido: 'Centro', tempoMin: 20, distancia: '4.0 km', isRealtime: false },
    { linha: '5106', destino: 'Bandeirantes / BH Shopping', sentido: 'Bairro', tempoMin: 24, distancia: '5.2 km', isRealtime: false },
    { linha: '30',   destino: 'Estação Diamante / Centro', sentido: 'Centro', tempoMin: 29, distancia: '6.4 km', isRealtime: false },
    { linha: '1502', destino: 'Vista Alegre / Bairro Guarani', sentido: 'Bairro', tempoMin: 35, distancia: '7.8 km', isRealtime: false },
  ];

  const onibusFiltrados = useMemo(() => {
    return listaOnibusBase.filter(item => {
      const matchText = 
        item.linha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destino.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSentido = filtroSentido === 'TODOS' || item.sentido === filtroSentido;
      return matchText && matchSentido;
    });
  }, [searchQuery, filtroSentido]);

  // Ação de Solicitar Embarque
  const handleSolicitar = async (e: React.MouseEvent, linha: string) => {
    e.stopPropagation();

    const toastId = `toast-${linha}`;
    addToast({ id: toastId, linha, status: 'loading', msg: `Enviando solicitação para linha ${linha}...` });
    falar(`Solicitando parada para o ônibus linha ${linha}. Notificando motorista.`);

    try {
      const pontoDescricao = gpsReady && userLocation
        ? `Ponto próximo ao GPS (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
        : 'Ponto central de embarque';

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
        vibrar([300, 100, 300, 100, 300]);
        falar(`Confirmado! Solicitação enviada com sucesso para a linha ${linha}. O motorista foi avisado e vai parar para você. Aguarde na calçada.`);
        addToast({ id: toastId, linha, status: 'success', msg: `✅ Linha ${linha} solicitada! Motorista avisado.` });
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

  // Funções dos 4 cards essenciais do design
  const handleEncontrarPonto = () => {
    falar('Iniciando orientação até o ponto de ônibus mais próximo.');
    vibrar([150, 50, 150]);
    router.push('/passageiro/navegacao');
  };

  const handleEncontrarOnibus = () => {
    falar('Localizando ônibus e linhas disponíveis para você.');
    vibrar([100]);
    if (busSectionRef.current) {
      busSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    const input = document.getElementById('campo-pesquisa-linhas');
    if (input) input.focus();
  };

  const handleReconhecerAmbiente = () => {
    setShowCamera(true);
    falar('Reconhecimento de ambiente ativado. Câmera aberta identificando pessoas, veículos e obstáculos no caminho.');
    vibrar([200]);
  };

  const handleOuvirOrientacoes = () => {
    const statusGPS = gpsReady ? 'Seu GPS está ativo e calibrado.' : 'Aguardando sinal GPS.';
    falar(`Orientações do trajeto: ${statusGPS} Você pode dizer seu destino pelo assistente de voz a qualquer momento. Em caso de necessidade, use o botão de Ajuda e SOS.`);
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

      {/* CONTAINER PRINCIPAL DA PROPOSTA DE ASSISTENTE POR VOZ */}
      <div className="bg-[#0b131e] border-2 border-white/10 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl mb-6">
        
        {/* HEADER DA PROPOSTA (IDÊNTICO AO DESIGN) */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-black text-[#00e6a8] tracking-tight">BusAcessível</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mt-1">
              Exemplo de Experiência do Passageiro
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* STATUS GPS */}
            <button
              onClick={requestGps}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                gpsReady 
                  ? 'bg-green-950/60 border-green-500/50 text-green-300' 
                  : gpsError
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300'
              }`}
              aria-label={gpsReady ? "GPS Ativo" : "Ativar GPS"}
            >
              <div className={`w-2 h-2 rounded-full ${gpsReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span>{gpsReady ? 'GPS Ativo' : 'GPS'}</span>
            </button>

            {/* BOTÃO SOS */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center border border-white text-white active:scale-95"
              aria-label="Ajuda e Emergência SOS"
            >
              <ShieldAlert size={18} />
            </button>

            {/* BOTÃO OUVIR INSTRUÇÃO */}
            <button
              onClick={() => falar('Bem-vindo ao BusAcessível. Toque no card azul para falar para onde deseja ir, ou utilize uma das quatro ações abaixo.')}
              className="w-9 h-9 rounded-full bg-[#00e6a8] flex items-center justify-center border border-black text-black active:scale-95"
              aria-label="Ouvir instruções por voz"
            >
              <Volume2 size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* HERO CARD CENTRAL: "OLÁ! PARA ONDE VOCÊ DESEJA IR?" (IDÊNTICO AO DESIGN) */}
        <div 
          onClick={() => setIsVoiceModalOpen(true)}
          className="bg-gradient-to-b from-[#123652] to-[#0c273c] border border-[#1e5077]/60 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all shadow-[0_10px_35px_rgba(0,180,216,0.15)] mb-6 hover:border-[#00e6a8]/50"
          role="button"
          tabIndex={0}
          aria-label="Assistente de voz: Olá! Para onde você deseja ir? Toque para falar seu destino agora"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white border border-white/10">
            <Mic size={30} strokeWidth={2.5} className="text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            Olá! Para onde você deseja ir?
          </h2>

          <p className="text-sm sm:text-base font-semibold text-cyan-100/70 max-w-sm">
            Diga seu destino. Vou ajudar você durante todo o trajeto.
          </p>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#033b32] text-[#00e6a8] border border-[#00e6a8]/40 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles size={14} /> Assistente de voz
            </span>
          </div>
        </div>

        {/* AS 4 AÇÕES ESSENCIAIS (GRADE 2X2 EXATA DA IMAGEM) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6" aria-label="Ações essenciais do passageiro">
          
          {/* 1. ENCONTRAR PONTO */}
          <button
            onClick={handleEncontrarPonto}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Encontrar ponto. Orientação por áudio"
          >
            <div className="mb-2 text-white">
              <MapPin size={32} strokeWidth={2} />
            </div>
            <span className="font-bold text-base text-white leading-tight">Encontrar ponto</span>
            <span className="text-xs text-gray-400 font-medium mt-0.5">Orientação por áudio</span>
          </button>

          {/* 2. ENCONTRAR ÔNIBUS */}
          <button
            onClick={handleEncontrarOnibus}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Encontrar ônibus. Identificação da linha"
          >
            <div className="mb-2 text-white">
              <Bus size={32} strokeWidth={2} />
            </div>
            <span className="font-bold text-base text-white leading-tight">Encontrar ônibus</span>
            <span className="text-xs text-gray-400 font-medium mt-0.5">Identificação da linha</span>
          </button>

          {/* 3. RECONHECER AMBIENTE */}
          <button
            onClick={handleReconhecerAmbiente}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Reconhecer ambiente. Descrição por voz"
          >
            <div className="mb-2 text-white">
              <Eye size={32} strokeWidth={2} />
            </div>
            <span className="font-bold text-base text-white leading-tight">Reconhecer ambiente</span>
            <span className="text-xs text-gray-400 font-medium mt-0.5">Descrição por voz</span>
          </button>

          {/* 4. OUVIR ORIENTAÇÕES */}
          <button
            onClick={handleOuvirOrientacoes}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#09111b] border border-white/10 active:border-[#00e6a8] transition-all hover:bg-[#0d1826]"
            aria-label="Ouvir orientações. Instruções durante a viagem"
          >
            <div className="mb-2 text-white">
              <Headphones size={32} strokeWidth={2} />
            </div>
            <span className="font-bold text-base text-white leading-tight">Ouvir orientações</span>
            <span className="text-xs text-gray-400 font-medium mt-0.5">Instruções durante a viagem</span>
          </button>

        </div>

      </div>

      {/* CÂMERA & MAPA DE NAVEGAÇÃO INTEGRADOS */}
      <section className="flex flex-col gap-4 mb-6" aria-label="Reconhecimento visual e mapa">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span className="text-[#00e6a8] font-black uppercase text-sm tracking-wider">👁️ Reconhecimento Visual</span>
          </div>
          <button
            onClick={() => {
              const novo = !showCamera;
              setShowCamera(novo);
              falar(novo ? 'Câmera aberta.' : 'Câmera oculta.');
            }}
            className="text-xs font-bold bg-[#111] border border-gray-700 px-3 py-1 rounded-full text-gray-300"
          >
            {showCamera ? 'Minimizar Câmera' : 'Abrir Câmera'}
          </button>
        </div>

        {showCamera && (
          <ObstacleDetector falar={falar} vibrar={vibrar} active={true} />
        )}

        <AccessibilityMap
          userLocation={userLocation}
          targetLocation={userLocation ? { lat: userLocation.lat + 0.0008, lng: userLocation.lng + 0.0008 } : null}
          falar={falar}
        />
      </section>

      {/* SEÇÃO DE ÔNIBUS E IDENTIFICAÇÃO DA LINHA */}
      <section ref={busSectionRef} className="mt-2 flex-1" aria-label="Próximos ônibus e linhas">
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2">
            <Bus color="#00e6a8" size={24} />
            <h2 className="text-[#00e6a8] font-black text-xl uppercase tracking-wider">Próximos Ônibus</h2>
          </div>
          <span className="text-xs font-bold text-gray-400">
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
            placeholder="Buscar por linha (ex: 8106, 51) ou destino..."
            className="w-full bg-[#111] border-2 border-gray-700 focus:border-[#00e6a8] text-white text-base font-bold py-3.5 pl-11 pr-11 rounded-2xl outline-none placeholder-gray-500"
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
              className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase border transition-all ${
                filtroSentido === sentido
                  ? 'bg-[#00e6a8] text-black border-[#00e6a8] font-black'
                  : 'bg-[#111] text-gray-300 border-gray-800'
              }`}
            >
              {sentido === 'TODOS' ? 'Todos os Sentidos' : `Sentido ${sentido}`}
            </button>
          ))}
        </div>

        {/* LISTA DE ÔNIBUS */}
        <div className="flex flex-col gap-3.5">
          {onibusFiltrados.map((onibus, index) => {
            const jaSolicitado = solicitados.has(onibus.linha);
            return (
              <div
                key={index}
                onClick={() => router.push(`/passageiro/linha/${onibus.linha}`)}
                className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  jaSolicitado
                    ? 'bg-green-950/80 border-green-500'
                    : 'bg-[#101722] border-white/5 active:border-[#00e6a8]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${
                      jaSolicitado ? 'bg-green-500 text-white' : 'bg-[#00e6a8] text-black'
                    }`}>
                      {jaSolicitado ? <CheckCircle size={28} /> : onibus.linha}
                    </div>

                    <div>
                      <p className="font-bold text-base text-white leading-snug">{onibus.destino}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {onibus.isRealtime ? (
                          <span className="text-[10px] font-black uppercase text-green-400 flex items-center gap-1">
                            <Radio size={10} className="animate-pulse" /> GPS Tempo Real
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">🕒 Horário Tabela</span>
                        )}
                        <span className="text-xs font-bold text-[#00e6a8]">
                          {jaSolicitado ? '✅ Solicitado' : `${onibus.tempoMin} min (${onibus.distancia})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      falar(`Linha ${onibus.linha}, ${onibus.destino}. Chega em ${onibus.tempoMin} minutos. ${onibus.isRealtime ? 'Rastreado por GPS' : 'Horário da escala'}.`);
                    }}
                    className="w-11 h-11 rounded-full bg-[#1b2636] flex items-center justify-center active:bg-[#25364e]"
                    aria-label={`Ouvir dados da linha ${onibus.linha}`}
                  >
                    <Volume2 size={20} color="#fff" />
                  </button>
                </div>

                <button
                  onClick={(e) => handleSolicitar(e, onibus.linha)}
                  disabled={jaSolicitado}
                  className={`w-full font-black text-base py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    jaSolicitado
                      ? 'bg-green-800 text-green-100 cursor-default'
                      : 'bg-[#00e6a8] text-black active:scale-95'
                  }`}
                  aria-label={`Solicitar parada do ônibus ${onibus.linha}`}
                >
                  {jaSolicitado ? (
                    <><CheckCircle size={20} /> Embarque Solicitado!</>
                  ) : (
                    <><Hand size={20} /> Solicitar Embarque</>
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
