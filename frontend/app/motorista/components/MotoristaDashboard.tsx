"use client";

import dynamic from 'next/dynamic';
import AlertCard from './AlertCard';

const DriverMap = dynamic(() => import('./DriverMap'), { ssr: false });

interface MotoristaDashboardProps {
  lineCode: string;
  gpsReady: boolean;
  alerts: any[];
  driverLocation: any;
  newAlertFlash?: boolean;
  onLogout: () => void;
  onNotify: (id: string) => void;
}

export default function MotoristaDashboard({
  lineCode,
  gpsReady,
  alerts,
  driverLocation,
  newAlertFlash = false,
  onLogout,
  onNotify
}: MotoristaDashboardProps) {
  return (
    <main className={`flex flex-col min-h-dvh bg-black text-white overflow-hidden font-sans transition-all duration-300 ${newAlertFlash ? 'ring-inset ring-8 ring-yellow-400' : ''}`}>

      {/* Flash de novo alerta */}
      {newAlertFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none animate-pulse bg-yellow-400/10 border-8 border-yellow-400 rounded-none" />
      )}

      {/* Header */}
      <header className={`px-6 py-6 border-b-[6px] flex items-center justify-between shadow-2xl transition-colors duration-300 ${newAlertFlash ? 'bg-yellow-950 border-yellow-400' : 'bg-[#111] border-[#FFCC00]'}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <span className="bg-[#FFCC00] text-black text-2xl font-black px-4 py-2 rounded-xl uppercase tracking-tighter">Linha</span>
            <h1 className="text-5xl font-black tracking-tighter text-white">{lineCode}</h1>
          </div>
          <div className="flex items-center gap-3 mt-3 bg-black p-3 rounded-xl border-2 border-gray-800">
            <div className={`w-4 h-4 rounded-full ${gpsReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-lg font-black text-gray-300 uppercase tracking-widest">
              {gpsReady ? 'GPS ATIVO' : 'BUSCANDO GPS...'}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-2xl font-black text-red-500 uppercase px-8 py-6 rounded-2xl bg-[#222] border-4 border-red-500 active:bg-red-500 active:text-white transition-all shadow-xl"
        >
          SAIR
        </button>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col gap-6 p-6 pt-4 overflow-hidden">

        {/* Mapa */}
        <div className="h-[28dvh] w-full shrink-0 border-[6px] border-[#FFCC00] rounded-[2rem] overflow-hidden shadow-2xl relative">
          <DriverMap driverLocation={driverLocation} alerts={alerts} />
          <div className="absolute top-3 left-3 pointer-events-none z-50">
            <span className="text-xl font-black uppercase text-[#FFCC00] bg-black/70 px-4 py-2 rounded-xl">
              📍 Mapa GPS
            </span>
          </div>
        </div>

        {/* Alertas */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {/* Cabeçalho Alertas */}
          <div className="flex items-center gap-4 px-2">
            <div className={`w-4 h-4 rounded-full ${alerts.length > 0 ? 'bg-[#FFCC00] animate-pulse' : 'bg-gray-600'}`} />
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/80">
              SOLICITAÇÕES DE PARADA
            </h2>
            <div className="flex-1 h-[2px] bg-white/20" />
            <span className={`text-3xl font-black px-6 py-2 rounded-full transition-colors ${
              alerts.length > 0 ? 'bg-[#FFCC00] text-black animate-bounce' : 'bg-[#222] text-white/40'
            }`}>
              {alerts.length}
            </span>
          </div>

          {/* Lista scrollável */}
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 pb-6">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-[#111] rounded-[2rem] border-4 border-dashed border-white/10 min-h-[200px]">
                <div className="text-8xl opacity-20 mb-4">🚌</div>
                <p className="text-xl font-black text-white/30 uppercase tracking-[0.15em] text-center px-8 leading-loose">
                  Nenhum passageiro<br />aguardando na rota
                </p>
                <p className="text-sm text-white/20 mt-2">Polling a cada 3 segundos</p>
              </div>
            ) : (
              alerts.map((alert: any) => (
                <AlertCard key={alert.id} alert={alert} lineCode={lineCode} onNotify={onNotify} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
