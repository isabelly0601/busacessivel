"use client";

import AlertCard from './AlertCard';

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
    <main className="flex flex-col min-h-dvh bg-[#0a0a0a] text-white animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#f59e0b]">LINHA {lineCode}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${gpsReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold text-white/40 uppercase">GPS {gpsReady ? 'Sincronizado' : 'Aguardando'}</span>
            </div>
          </div>
          <div className="text-right">
            <button onClick={onLogout} className="text-[10px] font-black text-red-500 uppercase border border-red-900/50 px-4 py-2 rounded-full bg-red-900/10 hover:bg-red-900/20 active:scale-95 transition-all">Sair</button>
          </div>
        </div>
      </header>

      {/* Main Alerts Area */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-6 text-center">
            <span className="text-9xl grayscale">🚍</span>
            <p className="text-xl font-black uppercase tracking-widest">Aguardando passageiros<br/>no trajeto em tempo real</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <h2 className="text-[#f59e0b] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Solicitações Ativas ({alerts.length})</h2>
            {alerts.map((alert: any) => (
              <AlertCard key={alert.id} alert={alert} onNotify={onNotify} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Driver Meta */}
      {driverLocation && (
        <footer className="p-4 bg-white/5 text-[8px] text-center text-white/20 font-mono tracking-tighter">
           LOC: {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)} | SESSION_ACTIVE
        </footer>
      )}
    </main>
  );
}
