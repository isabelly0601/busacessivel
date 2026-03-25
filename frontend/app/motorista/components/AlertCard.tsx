"use client";

interface AlertCardProps {
  alert: any;
  onNotify: (id: string) => void;
}

export default function AlertCard({ alert, onNotify }: AlertCardProps) {
  return (
    <div className="bg-[#1a1a1a] border-2 border-[#f59e0b]/30 rounded-4xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
      <div className="absolute top-0 left-0 w-2 h-full bg-[#f59e0b]" />
      
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase font-black text-white/40">Ponto de Ônibus</span>
        <p className="text-3xl font-black leading-tight text-white">{alert.ponto.nomeDescricao}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
           <span className="text-[10px] font-black text-red-400 uppercase">Atenção Aproximação</span>
        </div>
      </div>

      <button 
        onClick={() => onNotify(alert.id)}
        className="bg-white text-black py-8 rounded-3xl text-2xl font-black uppercase shadow-lg active:scale-95 transition-all"
      >
        Confirmar - Avisar Passageiro
      </button>
    </div>
  );
}
