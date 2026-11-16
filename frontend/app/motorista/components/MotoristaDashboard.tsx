"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  Bus, Settings, Check, MapPin, Clock, Volume2, VolumeX, 
  History, Play, Square, Home, BarChart3, Accessibility, 
  ChevronRight, X, CheckCircle2, AlertTriangle, ShieldCheck,
  Radio, Sparkles, Navigation, ArrowRight, UserCheck, RefreshCw
} from 'lucide-react';

const DriverMap = dynamic(() => import('./DriverMap'), { ssr: false });

export interface AlertaSolicitacao {
  id: string;
  ponto: {
    id?: string;
    nomeDescricao: string;
    latitude?: number;
    longitude?: number;
  };
  passageiro: {
    user: {
      nome: string;
    };
  };
  latitudePassageiro?: number;
  longitudePassageiro?: number;
  tipo?: string;
  timestamp?: string;
}

interface MotoristaDashboardProps {
  lineCode: string;
  setLineCode?: (line: string) => void;
  vehicleNumber?: string;
  setVehicleNumber?: (num: string) => void;
  gpsReady: boolean;
  alerts: AlertaSolicitacao[];
  driverLocation: { lat: number; lng: number } | null;
  newAlertFlash?: boolean;
  isDriving: boolean;
  onStartTrip: () => void;
  onEndTrip: () => void;
  onNotify: (id: string) => Promise<void> | void;
}

export default function MotoristaDashboard({
  lineCode = '8106',
  setLineCode,
  vehicleNumber = '32018',
  setVehicleNumber,
  gpsReady,
  alerts = [],
  driverLocation,
  newAlertFlash = false,
  isDriving = true,
  onStartTrip,
  onEndTrip,
  onNotify
}: MotoristaDashboardProps) {

  // ── Estados de Navegação e Modais ──
  const [activeTab, setActiveTab] = useState<'inicio' | 'estatisticas' | 'acessibilidade'>('inicio');
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // ── Configurações de Áudio e Voz ──
  const [audioAtivo, setAudioAtivo] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);

  // ── Histórico de Embarques Confirmados ──
  const [historicoEmbarques, setHistoricoEmbarques] = useState<Array<{
    id: string;
    passageiro: string;
    ponto: string;
    horario: string;
    linha: string;
  }>>([
    {
      id: 'mock-1',
      passageiro: 'Carlos Eduardo (Deficiente Visual)',
      ponto: 'Av. Afonso Pena, 1500',
      horario: '14:12',
      linha: '8106'
    }
  ]);

  // ── Próxima Parada Dinâmica ──
  const [proximaParada, setProximaParada] = useState({
    nome: 'Av. Amazonas, 1730',
    tempoEstimado: '≈ 2 min'
  });

  // ── Alerta em Destaque ──
  // Se houver alertas reais recebidos da API, usa o primeiro; caso contrário, exibe o alerta exemplo da foto
  const [alertaConfirmadoLocal, setAlertaConfirmadoLocal] = useState(false);
  const [alertaSimuladoAtivo, setAlertaSimuladoAtivo] = useState(true);

  // ── Relógio do Status Bar ──
  const [currentTime, setCurrentTime] = useState('14:27');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // ── Síntese de Voz (TTS) desativada para o motorista conforme pedido ──
  const falar = useCallback((_texto: string) => {
    // Motorista opera em silêncio (áudio exclusivo do passageiro)
  }, []);

  // ── Feedback Tátil ──
  const vibrar = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }, []);

  // ── Ação de Confirmar Embarque ──
  const handleConfirmarEmbarque = async () => {
    vibrar([200, 100, 200]);
    setAlertaConfirmadoLocal(true);

    const pontoNome = alerts[0]?.ponto?.nomeDescricao || proximaParada.nome;
    const passageiroNome = alerts[0]?.passageiro?.user?.nome || 'Passageiro com deficiência visual';

    // Sem fala para o motorista — confirmação 100% visual e tátil

    // Registra no histórico
    const now = new Date();
    const horario = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setHistoricoEmbarques(prev => [
      {
        id: `emb-${Date.now()}`,
        passageiro: passageiroNome,
        ponto: pontoNome,
        horario,
        linha: lineCode
      },
      ...prev
    ]);

    // Chama endpoint PATCH de notificação se for alerta real
    if (alerts.length > 0) {
      try {
        await onNotify(alerts[0].id);
      } catch (err) {
        console.error('Erro ao notificar no backend:', err);
      }
    }

    // Após 3 segundos reseta o estado visual de confirmação
    setTimeout(() => {
      setAlertaConfirmadoLocal(false);
      if (alerts.length === 0) {
        setAlertaSimuladoAtivo(false);
      }
    }, 3500);
  };

  // ── Alternar Avisos por Áudio ──
  const handleToggleAudio = () => {
    const novo = !audioAtivo;
    setAudioAtivo(novo);
    vibrar([80]);
    if (novo) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Avisos por voz ativados.');
        u.lang = 'pt-BR';
        window.speechSynthesis.speak(u);
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // ── Iniciar e Finalizar Viagem ──
  const handleIniciarViagem = () => {
    onStartTrip();
    vibrar([150, 80, 150]);
    falar(`Viagem iniciada na linha ${lineCode}. Sistema de alertas acessíveis ativo.`);
  };

  const handleFinalizarViagem = () => {
    onEndTrip();
    vibrar([200]);
    falar(`Viagem finalizada na linha ${lineCode}.`);
  };

  // Determina se deve exibir o card de alerta na tela inicial (alerta real tem prioridade total)
  const alertaAtivo = alerts.length > 0 ? alerts[0] : (alertaSimuladoAtivo ? {
    id: 'simulado',
    ponto: { nomeDescricao: proximaParada.nome },
    passageiro: { user: { nome: 'Passageiro PCD' } }
  } : null);

  const temAlertaPendente = !!alertaAtivo;
  const textoPontoAtual = alertaAtivo?.ponto?.nomeDescricao || proximaParada.nome;
  const textoPassageiro = alertaAtivo?.passageiro?.user?.nome || 'Passageiro PCD';

  return (
    <div className="flex justify-center bg-[#070e1e] min-h-[100dvh] text-white font-sans antialiased">
      <main className="w-full max-w-4xl px-4 sm:px-8 py-4 sm:py-6 flex flex-col min-h-[100dvh] relative shadow-2xl pb-24">

        {/* ── HEADER: LOGO BUSACESSÍVEL + ENGRENAGEM DE CONFIGURAÇÃO ── */}
        <header className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ícone estilizado do ônibus com símbolo de acessibilidade */}
            <div className="relative text-[#38bdf8]">
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="8" width="26" height="32" rx="6" stroke="#38bdf8" strokeWidth="3" fill="#0d2342"/>
                <line x1="6" y1="20" x2="32" y2="20" stroke="#38bdf8" strokeWidth="2.5"/>
                <circle cx="12" cy="34" r="2.5" fill="#38bdf8"/>
                <circle cx="26" cy="34" r="2.5" fill="#38bdf8"/>
                <rect x="11" y="12" width="16" height="5" rx="1.5" fill="#38bdf8" fillOpacity="0.7"/>
                {/* Símbolo de cadeira de rodas / acessibilidade acoplado */}
                <circle cx="36" cy="22" r="3" fill="#38bdf8"/>
                <path d="M36 26V32H40M33 38C35.7614 38 38 35.7614 38 33" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center">
                <span className="text-2xl font-black text-white tracking-tight">Bus</span>
                <span className="text-2xl font-black text-[#38bdf8] tracking-tight">Acessível</span>
              </div>
              <p className="text-xs text-slate-400 font-medium -mt-1 tracking-wide">
                Dirigindo com inclusão
              </p>
            </div>
          </div>

          {/* Botão de Configurações */}
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
            aria-label="Configurações do motorista"
          >
            <Settings size={26} strokeWidth={2.2} />
          </button>
        </header>

        {/* ── CONTEÚDO PRINCIPAL (CONDICIONAL POR ABA) ── */}
        {activeTab === 'inicio' && (
          <div className="px-4 flex-1 flex flex-col gap-3.5 pt-1">

            {/* ── CARD 1: LINHA SELECIONADA & STATUS DE VIAGEM ── */}
            <div className="bg-[#0e172e] border border-blue-900/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                {/* Ícone frontal do ônibus */}
                <div className="w-11 h-11 flex items-center justify-center text-white">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6v6"/>
                    <path d="M16 6v6"/>
                    <path d="M4 6h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1H7v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
                    <circle cx="7" cy="15" r="1" fill="currentColor"/>
                    <circle cx="17" cy="15" r="1" fill="currentColor"/>
                  </svg>
                </div>

                {/* Divisor vertical */}
                <div className="w-[1px] h-10 bg-slate-700/60" />

                {/* Dados da linha */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block -mb-0.5">
                    Linha selecionada
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    {lineCode} - Santa Cruz
                  </h2>
                  <span className="text-xs font-medium text-slate-400 block mt-0.5">
                    Veículo: <span className="font-bold text-slate-300">{vehicleNumber}</span>
                  </span>
                </div>
              </div>

              {/* Status Pill: Em viagem ou Parado */}
              <div>
                {isDriving ? (
                  <div className="bg-[#0a271c] text-[#34d399] border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
                    <span>Em viagem</span>
                  </div>
                ) : (
                  <div className="bg-[#241c09] text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Parado</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 2: ALERTA HERO - SOLICITAÇÃO DE EMBARQUE! (DESTAQUE DA FOTO) ── */}
            {temAlertaPendente ? (
              <div className={`relative rounded-2xl p-4 transition-all duration-300 shadow-2xl overflow-hidden ${
                alertaConfirmadoLocal 
                  ? 'bg-[#09261a] border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                  : 'bg-gradient-to-r from-[#0c1a3b] to-[#0a1530] border-2 border-[#3b82f6] shadow-[0_0_25px_rgba(59,130,246,0.35)]'
              }`}>
                <div className="flex items-center justify-between gap-2">

                  {/* Lado Esquerdo: Ícone da Cadeira de Rodas com Ondas Sonoras Amarelas */}
                  <div className="relative shrink-0">
                    {/* 3 Ondas/Raios de som amarelos no topo esquerdo (\ | /) */}
                    <div className="absolute -top-2.5 -left-1 flex items-end gap-1 pointer-events-none">
                      <span className="inline-block w-1 h-2.5 bg-amber-300 rotate-[-35deg] rounded-full"></span>
                      <span className="inline-block w-1 h-3.5 bg-amber-300 -translate-y-0.5 rounded-full"></span>
                      <span className="inline-block w-1 h-2.5 bg-amber-300 rotate-[35deg] rounded-full"></span>
                    </div>

                    {/* Círculo azul vibrante preenchido */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                      alertaConfirmadoLocal ? 'bg-emerald-600' : 'bg-[#2563eb]'
                    }`}>
                      {alertaConfirmadoLocal ? (
                        <Check size={30} strokeWidth={3} className="text-white" />
                      ) : (
                        <Accessibility size={32} strokeWidth={2.4} className="text-white" />
                      )}
                    </div>
                  </div>

                  {/* Centro: Texto da Solicitação */}
                  <div className="flex-1 pl-3 pr-2">
                    <h3 className="text-[17px] font-bold text-white tracking-tight leading-tight">
                      {alertaConfirmadoLocal ? 'Embarque Confirmado!' : 'Solicitação de embarque!'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-snug mt-1 font-normal">
                      {alertaConfirmadoLocal
                        ? `Notificado! Aguarde o embarque de ${textoPassageiro}.`
                        : `${textoPassageiro} aguardando em: ${textoPontoAtual}.`}
                    </p>
                  </div>

                  {/* Divisor vertical */}
                  <div className="w-[1px] h-12 bg-blue-800/60 shrink-0" />

                  {/* Lado Direito: Botão Confirmar */}
                  <div className="shrink-0 pl-1">
                    <button
                      onClick={handleConfirmarEmbarque}
                      disabled={alertaConfirmadoLocal}
                      className={`px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all font-bold cursor-pointer ${
                        alertaConfirmadoLocal
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-blue-900/40'
                      }`}
                      aria-label="Confirmar solicitação de embarque"
                    >
                      <Check size={22} strokeWidth={3} />
                      <span className="text-xs tracking-wide">
                        {alertaConfirmadoLocal ? 'OK!' : 'Confirmar'}
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              /* Estado quando não há solicitação pendente */
              <div className="bg-[#0e172e] border border-blue-900/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-800/70 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Nenhum passageiro aguardando</h3>
                    <p className="text-xs text-slate-400">Aguardando alertas de embarque na linha {lineCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAlertaSimuladoAtivo(true);
                    falar('Novo passageiro com deficiência visual aguardando no próximo ponto.');
                  }}
                  className="text-xs font-semibold text-[#38bdf8] bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 rounded-lg active:scale-95"
                >
                  Simular
                </button>
              </div>
            )}

            {/* ── CARD 3: PRÓXIMA PARADA ── */}
            <div className="bg-[#0e172e] border border-blue-900/30 rounded-2xl p-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center text-[#3b82f6] shrink-0">
                  <MapPin size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Próxima parada
                  </span>
                  <span className="text-[15px] font-bold text-white tracking-wide block">
                    {textoPontoAtual}
                  </span>
                </div>
              </div>

              {/* Tempo estimado */}
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm shrink-0">
                <Clock size={16} strokeWidth={2.2} className="text-slate-400" />
                <span>{proximaParada.tempoEstimado}</span>
              </div>
            </div>

            {/* ── CARD 4: GRADE DE 3 AÇÕES RÁPIDAS (MINHA ROTA, AVISOS POR ÁUDIO, HISTÓRICO) ── */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Botão 1: Minha Rota */}
              <button
                onClick={() => setIsRouteModalOpen(true)}
                className="bg-[#0e172e] border border-blue-900/30 hover:border-blue-600/50 rounded-2xl p-3.5 flex flex-col items-center text-center justify-between active:scale-95 transition-all shadow-md group relative min-h-[110px]"
                aria-label="Abrir Minha Rota"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-950/70 flex items-center justify-center text-[#38bdf8] mb-1.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                    <line x1="9" y1="3" x2="9" y2="18"/>
                    <line x1="15" y1="6" x2="15" y2="21"/>
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Minha Rota</span>
                  <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                    Veja o trajeto da viagem
                  </span>
                </div>
                <div className="w-full flex justify-end mt-1 text-slate-500 group-hover:text-slate-300">
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Botão 2: Alertas Visuais */}
              <div
                className="bg-[#0e172e] border border-blue-900/30 rounded-2xl p-3.5 flex flex-col items-center text-center justify-between shadow-md relative min-h-[110px]"
                aria-label="Alertas visuais e luminosos"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-950/70 text-[#38bdf8] flex items-center justify-center mb-1.5">
                  <ShieldCheck size={24} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Alertas Visuais</span>
                  <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                    100% Silencioso e Luminoso
                  </span>
                </div>
                <div className="w-full flex justify-end mt-1 text-slate-500">
                  <span className="text-[10px] font-bold text-emerald-400">Ativo</span>
                </div>
              </div>

              {/* Botão 3: Histórico */}
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-[#0e172e] border border-blue-900/30 hover:border-blue-600/50 rounded-2xl p-3.5 flex flex-col items-center text-center justify-between active:scale-95 transition-all shadow-md group relative min-h-[110px]"
                aria-label="Abrir histórico de solicitações"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-950/70 flex items-center justify-center text-[#38bdf8] mb-1.5">
                  <History size={24} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Histórico</span>
                  <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                    Consulte suas solicitações
                  </span>
                </div>
                <div className="w-full flex justify-end mt-1 text-slate-500 group-hover:text-slate-300">
                  <ChevronRight size={14} />
                </div>
              </button>

            </div>

            {/* ── CARD 5: BOTÕES DE AÇÃO PRINCIPAIS (INICIAR VIAGEM / FINALIZAR VIAGEM) ── */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {/* Botão Verde: Iniciar Viagem */}
              <button
                onClick={handleIniciarViagem}
                className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isDriving 
                    ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-950/50' 
                    : 'bg-[#0f2e22] text-[#34d399] border border-emerald-500/40 hover:bg-[#10b981] hover:text-white'
                }`}
                aria-label="Iniciar viagem"
              >
                <Play size={18} fill="currentColor" strokeWidth={0} />
                <span className="text-[15px] font-bold">Iniciar Viagem</span>
              </button>

              {/* Botão Vermelho: Finalizar Viagem */}
              <button
                onClick={handleFinalizarViagem}
                className="py-4 px-4 rounded-2xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-red-950/50 active:scale-95 cursor-pointer"
                aria-label="Finalizar viagem"
              >
                <Square size={16} fill="currentColor" strokeWidth={0} />
                <span className="text-[15px] font-bold">Finalizar Viagem</span>
              </button>
            </div>

          </div>
        )}

        {/* ── ABA 2: ESTATÍSTICAS ── */}
        {activeTab === 'estatisticas' && (
          <div className="px-5 py-4 flex-1 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-[#38bdf8]" />
              Estatísticas da Jornada
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Passageiros PCD</span>
                <p className="text-3xl font-black text-[#38bdf8] mt-1">{historicoEmbarques.length + 3}</p>
                <span className="text-[11px] text-emerald-400 mt-1 block">Atendidos hoje</span>
              </div>

              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Pontualidade</span>
                <p className="text-3xl font-black text-emerald-400 mt-1">98%</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Em dia na rota</span>
              </div>

              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Viagens Feitas</span>
                <p className="text-3xl font-black text-white mt-1">4</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Linha {lineCode}</span>
              </div>

              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Status GPS</span>
                <p className={`text-xl font-bold mt-2 ${gpsReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {gpsReady ? 'Conectado' : 'Simulado'}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Precisão alta</span>
              </div>
            </div>

            <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl mt-2">
              <h3 className="text-sm font-bold text-white mb-2">Linha em Operação</h3>
              <p className="text-xs text-slate-300">
                <span className="font-bold text-white">{lineCode} - Santa Cruz</span> | Veículo: {vehicleNumber}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Conectado ao sistema de telemetria metropolitana de Belo Horizonte.
              </p>
            </div>
          </div>
        )}

        {/* ── ABA 3: ACESSIBILIDADE & DIRETRIZES DO MOTORISTA ── */}
        {activeTab === 'acessibilidade' && (
          <div className="px-5 py-4 flex-1 flex flex-col gap-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Accessibility className="text-[#38bdf8]" />
              Guia de Condução Inclusiva
            </h2>

            <div className="space-y-3">
              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                  <span>1.</span> Parada Alinhada à Calçada
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ao avistar a solicitação de embarque, encoste o ônibus o mais rente possível do meio-fio para facilitar o acesso de pessoas cegas ou com mobilidade reduzida.
                </p>
              </div>

              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                  <span>2.</span> Anuncie a Linha em Voz Alta
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ao abrir a porta dianteira, confirme em voz audível o número da linha e o sentido (ex: <em>&quot;Linha 8106 sentido Centro&quot;</em>).
                </p>
              </div>

              <div className="bg-[#0e172e] border border-blue-900/30 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                  <span>3.</span> Aguarde a Acomodação
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Inicie a partida do veículo somente após o passageiro com deficiência visual estar acomodado com segurança no assento preferencial.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM NAVIGATION BAR ── */}
        <nav 
          className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto bg-[#070e1e]/95 border-t border-slate-800/80 px-6 py-2.5 flex items-center justify-around z-40 backdrop-blur-md"
          role="navigation"
          aria-label="Navegação inferior do motorista"
        >
          {/* Aba 1: Início */}
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative group cursor-pointer"
          >
            <Home 
              size={22} 
              strokeWidth={activeTab === 'inicio' ? 2.5 : 2}
              className={activeTab === 'inicio' ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-300'} 
            />
            <span className={`text-[11px] font-bold mt-1 ${
              activeTab === 'inicio' ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              Início
            </span>
            {/* Barra indicadora azul ativa embaixo */}
            {activeTab === 'inicio' && (
              <span className="absolute bottom-0 w-8 h-[3px] bg-[#38bdf8] rounded-full"></span>
            )}
          </button>

          {/* Divisor vertical sutil */}
          <div className="w-[1px] h-6 bg-slate-800" />

          {/* Aba 2: Estatísticas */}
          <button
            onClick={() => setActiveTab('estatisticas')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative group cursor-pointer"
          >
            <BarChart3 
              size={22} 
              strokeWidth={activeTab === 'estatisticas' ? 2.5 : 2}
              className={activeTab === 'estatisticas' ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-300'} 
            />
            <span className={`text-[11px] font-bold mt-1 ${
              activeTab === 'estatisticas' ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              Estatísticas
            </span>
            {activeTab === 'estatisticas' && (
              <span className="absolute bottom-0 w-8 h-[3px] bg-[#38bdf8] rounded-full"></span>
            )}
          </button>

          {/* Divisor vertical sutil */}
          <div className="w-[1px] h-6 bg-slate-800" />

          {/* Aba 3: Acessibilidade */}
          <button
            onClick={() => setActiveTab('acessibilidade')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative group cursor-pointer"
          >
            <Accessibility 
              size={22} 
              strokeWidth={activeTab === 'acessibilidade' ? 2.5 : 2}
              className={activeTab === 'acessibilidade' ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-300'} 
            />
            <span className={`text-[11px] font-bold mt-1 ${
              activeTab === 'acessibilidade' ? 'text-[#38bdf8]' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              Acessibilidade
            </span>
            {activeTab === 'acessibilidade' && (
              <span className="absolute bottom-0 w-8 h-[3px] bg-[#38bdf8] rounded-full"></span>
            )}
          </button>
        </nav>

        {/* ── MODAL: MINHA ROTA & MAPA GPS ── */}
        {isRouteModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-0">
            <div className="bg-[#0b1426] border-t-2 border-blue-500 rounded-t-3xl max-h-[85dvh] flex flex-col p-5 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Navigation className="text-[#38bdf8]" size={22} />
                  <h3 className="text-lg font-bold text-white">Trajeto da Linha {lineCode}</h3>
                </div>
                <button
                  onClick={() => setIsRouteModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mapa Leaflet Real */}
              <div className="h-64 w-full rounded-2xl overflow-hidden my-4 border border-blue-900/40 relative">
                <DriverMap driverLocation={driverLocation} alerts={alerts} />
              </div>

              {/* Lista de Pontos da Linha */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Próximas Paradas
                </span>
                {[
                  { nome: 'Av. Amazonas, 1730 (Próxima)', status: 'ALERTA PCD', tempo: '≈ 2 min', ativo: true },
                  { nome: 'Praça Raul Soares, 450', status: 'Livre', tempo: '≈ 5 min', ativo: false },
                  { nome: 'Av. Afonso Pena, 800', status: 'Livre', tempo: '≈ 9 min', ativo: false },
                  { nome: 'Estação Central / Praça da Estação', status: 'Livre', tempo: '≈ 14 min', ativo: false }
                ].map((p, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
                    p.ativo ? 'bg-blue-950/60 border-blue-500 text-white' : 'bg-[#0e172e] border-slate-800 text-slate-300'
                  }`}>
                    <div>
                      <p className="text-xs font-bold">{p.nome}</p>
                      <span className={`text-[10px] font-semibold ${p.ativo ? 'text-amber-400' : 'text-slate-400'}`}>
                        {p.status}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{p.tempo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: HISTÓRICO DE EMBARQUES ── */}
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-0">
            <div className="bg-[#0b1426] border-t-2 border-blue-500 rounded-t-3xl max-h-[80dvh] flex flex-col p-5 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="text-[#38bdf8]" size={22} />
                  <h3 className="text-lg font-bold text-white">Histórico de Solicitações</h3>
                </div>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {historicoEmbarques.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Nenhum embarque realizado ainda nesta jornada.</p>
                ) : (
                  historicoEmbarques.map(item => (
                    <div key={item.id} className="bg-[#0e172e] border border-blue-900/30 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{item.passageiro}</p>
                          <span className="text-[11px] text-slate-400 block">{item.ponto}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#38bdf8]">{item.horario}</span>
                        <span className="text-[10px] text-slate-400 block">Linha {item.linha}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: CONFIGURAÇÕES DO MOTORISTA ── */}
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-0">
            <div className="bg-[#0b1426] border-t-2 border-blue-500 rounded-t-3xl max-h-[85dvh] flex flex-col p-5 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings className="text-[#38bdf8]" size={22} />
                  <h3 className="text-lg font-bold text-white">Configurações do Terminal</h3>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Linha em Condução
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['8106', '51', '61', '30'].map(l => (
                      <button
                        key={l}
                        onClick={() => {
                          if (setLineCode) setLineCode(l);
                          falar(`Linha alterada para ${l}.`);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          lineCode === l 
                            ? 'bg-[#38bdf8] text-black border-[#38bdf8]' 
                            : 'bg-[#0e172e] border-slate-700 text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Número do Veículo
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber && setVehicleNumber(e.target.value)}
                    className="w-full bg-[#0e172e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setAlertaSimuladoAtivo(true);
                      setIsSettingsModalOpen(false);
                      falar('Simulação ativada: Um passageiro com deficiência visual está aguardando no próximo ponto.');
                    }}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Sparkles size={18} />
                    Gerar Solicitação de Embarque Teste
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
