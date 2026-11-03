"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bus, Volume2, Hand, CheckCircle, XCircle, Loader2, 
  Mic, Navigation, AlertTriangle, Search, Radio, Compass,
  MapPin, ShieldAlert, Sparkles, X, ChevronDown, ChevronUp
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
  const [showCamera, setShowCamera] = useState(true);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSentido, setFiltroSentido] = useState<'TODOS' | 'Centro' | 'Bairro'>('TODOS');

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

  // Solicitar e Monitorar GPS com tratamento de permissão
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
          falar('Atenção: Permissão de localização negada ou GPS desativado. Ative a localização nas configurações do seu celular.');
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
          console.warn("Watch GPS:", err);
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

  // Linhas de ônibus com distinção transparente entre Tempo Real (GPS do veículo) e Horário Previsto
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

  // Filtro de ônibus por texto e sentido
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
        : 'Ponto de parada central';

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
        falar(`Confirmado! Solicitação enviada com sucesso para a linha ${linha}. O motorista foi avisado e vai parar para você. Fique na calçada.`);
        addToast({ id: toastId, linha, status: 'success', msg: `✅ Linha ${linha} solicitada! Motorista notificado.` });
        setTimeout(() => removeToast(toastId), 6000);
      } else {
        const error = await res.json();
        falar(`Não foi possível enviar a solicitação para a linha ${linha}. Tente novamente.`);
        addToast({ id: toastId, linha, status: 'error', msg: `❌ Erro: ${error.error || 'Falha ao solicitar'}` });
        setTimeout(() => removeToast(toastId), 4000);
      }
    } catch {
      falar(`Erro de conexão ao solicitar a linha ${linha}. Verifique sua internet.`);
      addToast({ id: toastId, linha, status: 'error', msg: '❌ Erro de conexão com o servidor.' });
      setTimeout(() => removeToast(toastId), 4000);
    }
  };

  return (
    <main 
      className="flex flex-col min-h-[100dvh] bg-[#000] text-white p-4 sm:p-6 pb-28 relative"
      role="main"
      aria-label="Tela principal do passageiro - Aplicativo Vai de Ônibus"
    >
      {/* TOASTS DE NOTIFICAÇÃO AUDÍVEIS E VISUAIS */}
      <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="assertive">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-4 shadow-2xl pointer-events-auto transition-all duration-300 ${
              toast.status === 'loading' ? 'bg-[#1a1a00] border-[#FFCC00] text-white' :
              toast.status === 'success' ? 'bg-green-950 border-green-500 text-green-200' :
              'bg-red-950 border-red-500 text-red-200'
            }`}
          >
            {toast.status === 'loading' && <Loader2 size={24} className="animate-spin text-[#FFCC00] shrink-0" />}
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

      {/* STATUS DO GPS & TOPO */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pt-2">
        <span className="text-[13px] text-[#FFCC00] font-black uppercase tracking-[0.25em]">
          🚍 Vai de Ônibus
        </span>

        {/* STATUS DINÂMICO DO GPS COM BOTÃO DE AÇÃO */}
        <button
          onClick={requestGps}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
            gpsReady 
              ? 'bg-green-950/70 border-green-500 text-green-300' 
              : gpsError
              ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
              : 'bg-yellow-950/60 border-yellow-500 text-yellow-300'
          }`}
          aria-label={gpsReady ? "GPS Ativo com alta precisão. Toque para atualizar" : "GPS não localizado. Toque para permitir acesso à localização"}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${gpsReady ? 'bg-green-400 animate-pulse' : gpsError ? 'bg-red-400' : 'bg-yellow-400 animate-ping'}`} />
          <span className="text-xs font-black uppercase tracking-wider">
            {gpsReady ? 'GPS Ativo' : gpsError ? '⚠️ Ativar GPS' : 'Buscando GPS...'}
          </span>
        </button>
      </div>

      {/* HEADER PRINCIPAL COM LEITURA EM VOZ ALTA */}
      <header className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-4xl font-black text-[#FFCC00] tracking-tight">Painel Acessível</h1>
          <p className="text-gray-300 font-bold text-sm">Autonomia e mobilidade no transporte público</p>
        </div>
        <button
          onClick={() => falar('Tela inicial do passageiro. No topo você encontra quatro botões principais: Falar com o aplicativo, Encontrar ponto de ônibus, Pesquisar linhas e Botão de Ajuda. Abaixo está a câmera com detector de obstáculos e a lista dos próximos ônibus.')}
          className="w-14 h-14 bg-[#FFCC00] rounded-full flex items-center justify-center border-4 border-black active:scale-95 transition-transform shadow-lg shrink-0"
          aria-label="Ouvir instruções de toda a página por áudio"
        >
          <Volume2 color="#000" size={28} strokeWidth={3} />
        </button>
      </header>

      {/* 4 BOTÕES GIGANTES DE AÇÃO RÁPIDA (REQUISITO 4 DA PROPOSTA) */}
      <section 
        className="grid grid-cols-2 gap-3 sm:gap-4 mb-6"
        aria-label="Ações rápidas principais"
      >
        {/* 1. FALAR COM O APLICATIVO */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="bg-[#FFCC00] text-black p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 border-4 border-black active:scale-95 transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)] min-h-[120px]"
          aria-label="Falar com o aplicativo por comando de voz"
        >
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <Mic color="#FFCC00" size={28} strokeWidth={3} />
          </div>
          <span className="font-black text-lg leading-tight uppercase">Falar com o App</span>
        </button>

        {/* 2. ENCONTRAR PONTO DE ÔNIBUS */}
        <button
          onClick={() => {
            falar('Abrindo navegação guiada até o ponto de ônibus mais próximo.');
            router.push('/passageiro/navegacao');
          }}
          className="bg-[#111] text-white p-5 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 border-4 border-[#FFCC00] active:scale-95 transition-all shadow-lg min-h-[120px]"
          aria-label="Encontrar ponto de ônibus e iniciar navegação guiada"
        >
          <div className="w-12 h-12 rounded-full bg-[#FFCC00] flex items-center justify-center">
            <Compass color="#000" size={28} strokeWidth={3} />
          </div>
          <span className="font-black text-lg leading-tight uppercase text-[#FFCC00]">Achar Ponto</span>
        </button>

        {/* 3. PESQUISAR LINHA */}
        <button
          onClick={() => {
            const el = document.getElementById('campo-pesquisa-linhas');
            if (el) el.focus();
            falar('Pesquisar linhas de ônibus. Digite o número ou selecione na lista abaixo.');
          }}
          className="bg-[#111] text-white p-4 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 border-4 border-gray-700 active:border-[#FFCC00] transition-all min-h-[110px]"
          aria-label="Buscar linha de ônibus pelo número ou destino"
        >
          <Search color="#FFCC00" size={28} strokeWidth={3} />
          <span className="font-black text-base leading-tight uppercase">Pesquisar Linha</span>
        </button>

        {/* 4. BOTÃO DE AJUDA & SOS */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="bg-red-600 text-white p-4 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 border-4 border-white active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.5)] min-h-[110px]"
          aria-label="Botão de Ajuda e Emergência. Toque para contatar pessoa de confiança ou acionar alarme"
        >
          <ShieldAlert color="#fff" size={30} strokeWidth={3} className="animate-pulse" />
          <span className="font-black text-base leading-tight uppercase">Ajuda & SOS</span>
        </button>
      </section>

      {/* CÂMERA E MAPA COM TOGGLE ACESSÍVEL */}
      <section className="flex flex-col gap-4 mb-6" aria-label="Câmera de obstáculos e mapa">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[#FFCC00] text-xl">👁️</span>
            <h2 className="text-[#FFCC00] font-black text-xl uppercase tracking-wider">Câmera & IA</h2>
          </div>
          <button
            onClick={() => {
              const novo = !showCamera;
              setShowCamera(novo);
              falar(novo ? 'Câmera ativada.' : 'Câmera minimizada.');
            }}
            className="flex items-center gap-2 text-xs font-bold bg-[#111] border-2 border-gray-700 px-3 py-1.5 rounded-full text-gray-300 active:border-[#FFCC00]"
            aria-label={showCamera ? "Minimizar câmera de detecção" : "Exibir câmera de detecção"}
          >
            {showCamera ? <>Ocultar <ChevronUp size={16} /></> : <>Exibir Câmera <ChevronDown size={16} /></>}
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

      {/* SEÇÃO DE ÔNIBUS COM PESQUISA E FILTROS */}
      <section className="mt-2 flex-1" aria-label="Lista de linhas de ônibus próximas">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Bus color="#FFCC00" size={26} />
            <h2 className="text-[#FFCC00] font-black text-2xl uppercase tracking-wider">Próximos Ônibus</h2>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {onibusFiltrados.length} disponíveis
          </span>
        </div>

        {/* BARRA DE PESQUISA RÁPIDA */}
        <div className="relative mb-3">
          <input
            id="campo-pesquisa-linhas"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número (ex: 8106, 51) ou destino..."
            className="w-full bg-[#111] border-4 border-[#333] focus:border-[#FFCC00] text-white text-lg font-bold py-4 pl-12 pr-12 rounded-2xl outline-none placeholder-gray-500"
            aria-label="Campo para digitar e filtrar linhas de ônibus"
          />
          <Search size={22} color="#FFCC00" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); falar('Busca limpa.'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              aria-label="Limpar texto da busca"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* FILTROS DE SENTIDO (TODOS / CENTRO / BAIRRO) */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" role="radiogroup" aria-label="Filtrar sentido do ônibus">
          {(['TODOS', 'Centro', 'Bairro'] as const).map(sentido => (
            <button
              key={sentido}
              onClick={() => {
                setFiltroSentido(sentido);
                falar(`Filtrando por ${sentido === 'TODOS' ? 'todos os sentidos' : `sentido ${sentido}`}`);
              }}
              className={`px-4 py-2.5 rounded-xl font-black text-sm uppercase transition-all border-2 ${
                filtroSentido === sentido
                  ? 'bg-[#FFCC00] text-black border-black shadow-md'
                  : 'bg-[#111] text-gray-300 border-[#333]'
              }`}
              role="radio"
              aria-checked={filtroSentido === sentido}
            >
              {sentido === 'TODOS' ? 'Todos os Sentidos' : `Sentido ${sentido}`}
            </button>
          ))}
        </div>

        {/* LISTAGEM DOS CARDS DE ÔNIBUS */}
        <div className="flex flex-col gap-4">
          {onibusFiltrados.length === 0 ? (
            <div className="bg-[#111] border-2 border-gray-700 p-8 rounded-2xl text-center">
              <p className="text-xl font-bold text-gray-400">Nenhum ônibus encontrado para "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 bg-[#FFCC00] text-black font-black px-6 py-3 rounded-xl uppercase text-sm"
              >
                Ver todas as linhas
              </button>
            </div>
          ) : (
            onibusFiltrados.map((onibus, index) => {
              const jaSolicitado = solicitados.has(onibus.linha);
              return (
                <div
                  key={index}
                  onClick={() => router.push(`/passageiro/linha/${onibus.linha}`)}
                  className={`flex flex-col p-5 rounded-[2rem] border-4 cursor-pointer transition-all duration-300 ${
                    jaSolicitado
                      ? 'bg-green-950 border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.4)]'
                      : 'bg-[#111] border-[#333] active:border-[#FFCC00] hover:border-gray-500'
                  }`}
                  role="article"
                  aria-label={`Linha ${onibus.linha}, ${onibus.destino}, chega em ${onibus.tempoMin} minutos. ${onibus.isRealtime ? 'Rastreamento em tempo real via GPS' : 'Horário estimado de escala'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      
                      {/* BADGE DA LINHA */}
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-lg shrink-0 transition-colors ${
                        jaSolicitado ? 'bg-green-500 border-green-700' : 'bg-[#FFCC00] border-black shadow-[0_0_15px_rgba(255,204,0,0.25)]'
                      }`}>
                        {jaSolicitado ? (
                          <CheckCircle color="#fff" size={36} />
                        ) : (
                          <span className="text-black font-black text-2xl tracking-tighter">{onibus.linha}</span>
                        )}
                      </div>

                      {/* INFORMAÇÕES DA ROTA */}
                      <div className="flex flex-col gap-1">
                        <p className="font-black text-xl text-white leading-tight">{onibus.destino}</p>
                        
                        {/* DISTINÇÃO CLARA ENTRE TEMPO REAL E ESTIMADO */}
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {onibus.isRealtime ? (
                            <span className="bg-green-900/80 text-green-300 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-green-500/50 flex items-center gap-1">
                              <Radio size={12} className="animate-pulse" /> Tempo Real GPS
                            </span>
                          ) : (
                            <span className="bg-gray-800 text-gray-300 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-gray-600">
                              🕒 Previsto
                            </span>
                          )}
                          <span className="text-sm font-black text-[#FFCC00]">
                            {jaSolicitado ? '✅ Embarque solicitado' : `Chega em ${onibus.tempoMin} min (${onibus.distancia})`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTÃO DE OUVIR A LINHA ESPECÍFICA */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        falar(`Linha ${onibus.linha}, ${onibus.destino}. Chega em ${onibus.tempoMin} minutos, a ${onibus.distancia} de distância. ${onibus.isRealtime ? 'Rastreado em tempo real via GPS' : 'Horário previsto na tabela'}.`);
                      }}
                      className="w-14 h-14 rounded-full bg-[#222] border-2 border-gray-600 flex items-center justify-center active:bg-[#333] shrink-0"
                      aria-label={`Ouvir detalhes da linha ${onibus.linha}`}
                    >
                      <Volume2 color="#fff" size={26} />
                    </button>
                  </div>

                  {/* BOTÃO GIGANTE DE SOLICITAR EMBARQUE */}
                  <button
                    onClick={(e) => handleSolicitar(e, onibus.linha)}
                    disabled={jaSolicitado}
                    className={`w-full font-black text-xl py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
                      jaSolicitado
                        ? 'bg-green-800 text-green-200 border-green-600 cursor-default opacity-90'
                        : 'bg-[#FFCC00] text-black border-black shadow-md hover:bg-yellow-400'
                    }`}
                    aria-label={`Solicitar parada e embarque para a linha ${onibus.linha}`}
                  >
                    {jaSolicitado ? (
                      <><CheckCircle size={24} /> Motorista Avisado!</>
                    ) : (
                      <><Hand size={24} strokeWidth={3} /> Solicitar Embarque</>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* MODAL DO ASSISTENTE DE VOZ INTELIGENTE */}
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
