"use client";

interface AlertCardProps {
  alert: any;
  onNotify: (id: string) => void;
}

export default function AlertCard({ alert, onNotify }: AlertCardProps) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-6 relative overflow-hidden group border-brand-primary/20 hover:border-brand-primary/50 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all" />

      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-black text-brand-primary tracking-widest">
            Embarque Solicitado
          </span>
          <h3 className="text-2xl font-black leading-tight text-white">
            {alert.ponto.nomeDescricao}
          </h3>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl">
          <span className="text-2xl">♿</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 z-10">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <span className="text-[8px] font-black uppercase text-white/30 block mb-1">
            Passageiro
          </span>
          <span className="text-xs font-bold text-white/80">
            {alert.passageiro.user.nome}
          </span>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          <span className="text-[8px] font-black uppercase text-white/30 block mb-1">
            Status
          </span>
          <span className="text-xs font-bold text-green-400">
            Aguardando no Ponto
          </span>
        </div>
      </div>

      <button
        onClick={() => onNotify(alert.id)}
        className="btn-primary py-5 text-lg font-black uppercase tracking-widest relative overflow-hidden group-active:scale-95 transition-all"
      >
        <span className="relative z-10">Notificar Chegada</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>

      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
    </div>
  );
}
