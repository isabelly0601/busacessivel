"use client";

import dynamic from 'next/dynamic';
import AlertCard from './AlertCard';

const DriverMap = dynamic(() => import('./DriverMap'), { ssr: false });

interface MotoristaDashboardProps {
  lineCode: string;
  gpsReady: boolean;
  alerts: any[];
  driverLocation: any;
  onLogout: () => void;
  onNotify: (id: string) => void;
}

export default function MotoristaDashboard({
  lineCode,
  gpsReady,
  alerts,
  driverLocation,
  onLogout,
  onNotify
}: MotoristaDashboardProps) {
  return (
    <main className="flex flex-col min-h-dvh bg-bg-deep text-white animate-in fade-in duration-500 overflow-hidden font-sans">
      <header className="px-6 py-5 glass-panel m-4 mb-2 flex items-center justify-between border-brand-primary/20">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="bg-brand-primary text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">
              Linha
            </span>
            <h1 className="text-2xl font-black tracking-tighter text-white">{lineCode}</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${gpsReady ? 'bg-green-500 glow-pulse' : 'bg-red-500'}`} />
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
              {gpsReady ? 'Sinal GPS Estabilizado' : 'Buscando GPS...'}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-[10px] font-black text-red-500 uppercase px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/20 active:scale-90 transition-all"
        >
          Encerrar
        </button>
      </header>

      <div className="flex-1 flex flex-col gap-4 p-4 pt-0 overflow-hidden">
        <div className="h-[25dvh] w-full shrink-0">
          <DriverMap driverLocation={driverLocation} alerts={alerts} />
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[7px] font-black uppercase text-white/20 tracking-widest">
              Mapeamento em Tempo Real
            </span>
            <span className="text-[7px] font-black uppercase text-brand-primary tracking-widest animate-pulse">
              Scan Ativo
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-brand-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
              Solicitações de Parada
            </h2>
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center glass-panel bg-white/[0.01] border-dashed border-white/5">
                <div className="text-4xl opacity-20 mb-4 animate-float">🚌</div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center px-8 leading-loose">
                  Nenhum passageiro PCD aguardando
                  <br />
                  nesta região da rota
                </p>
              </div>
            ) : (
              alerts.map((alert: any) => (
                <AlertCard key={alert.id} alert={alert} onNotify={onNotify} />
              ))
            )}
          </div>
        </div>
      </div>

      <footer className="px-6 py-4 glass-panel m-4 mt-0 bg-brand-secondary/5 border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase text-white/30 tracking-widest mb-1">
              Próxima Parada Estimada
            </span>
            <span className="text-xs font-bold text-white/80">
              Estação Central (Aprox. 4 min)
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right">
            <span className="text-[7px] font-black uppercase text-white/30 tracking-widest mb-1">
              Telemetria
            </span>
            <span className="text-xs font-mono font-bold text-brand-primary leading-none block">
              34 KM/H
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
