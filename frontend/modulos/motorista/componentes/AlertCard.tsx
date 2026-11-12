"use client";

interface AlertCardProps {
  alert: any;
  lineCode: string;
  onNotify: (id: string) => void;
}

export default function AlertCard({ alert, lineCode, onNotify }: AlertCardProps) {
  return (
    <div className="bg-[#111] p-6 flex flex-col gap-6 relative overflow-hidden group border-[6px] border-brand-primary rounded-[2rem] shadow-xl">
      
      {/* Visual Indicator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/30 transition-all" />
      
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <span className="text-xl uppercase font-black text-brand-primary tracking-widest">Aguardando no Ponto</span>
          <h3 className="text-4xl font-black leading-tight text-white">{alert.ponto.nomeDescricao}</h3>
        </div>
        <div className="bg-[#222] p-4 rounded-2xl border-4 border-white">
           <span className="text-4xl">♿</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 z-10">
        <div className="bg-black rounded-2xl p-4 border-[3px] border-white/20">
           <span className="text-sm font-black uppercase text-brand-primary block mb-1">Passageiro</span>
           <span className="text-2xl font-black text-white">{alert.passageiro.user.nome}</span>
        </div>
        <div className="bg-black rounded-2xl p-4 border-[3px] border-white/20">
           <span className="text-sm font-black uppercase text-brand-primary block mb-1">Status</span>
           <span className="text-2xl font-black text-green-400">Ponto {alert.ponto.nomeDescricao}</span>
        </div>
      </div>

      <button 
        onClick={() => onNotify(alert.id)}
        className="w-full bg-blue-600 border-8 border-blue-800 text-white py-10 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group-active:scale-95 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)]"
      >
        <span className="text-5xl font-black uppercase tracking-widest text-center">🚌 {lineCode}</span>
        <span className="text-3xl font-black uppercase tracking-widest opacity-90 mt-2">NOTIFICAR CHEGADA</span>
      </button>

      {/* Background Pulse for urgency */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
    </div>
  );
}
