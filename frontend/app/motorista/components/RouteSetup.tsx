"use client";

interface RouteSetupProps {
  lineCode: string;
  setLineCode: (val: string) => void;
  onStart: () => void;
}

export default function RouteSetup({ lineCode, setLineCode, onStart }: RouteSetupProps) {
  return (
    <main className="min-h-dvh bg-bg-deep flex flex-col items-center justify-center p-8 gap-12 animate-in fade-in duration-700">
      <div className="flex flex-col items-center gap-4 animate-float">
        <div className="w-24 h-24 glass-panel flex items-center justify-center bg-brand-primary/10 border-brand-primary/30">
          <span className="text-5xl">🚍</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Frotas <span className="text-brand-primary">Bus Acessível</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mt-1">
            Terminal de Operação do Motorista
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] ml-4">
            Identificador da Linha
          </p>
          <input
            type="text"
            placeholder="Ex: 340-A"
            className="premium-input text-center text-4xl font-black uppercase tracking-widest placeholder:opacity-10"
            value={lineCode}
            onChange={(e) => setLineCode(e.target.value)}
          />
        </div>
        <button
          onClick={onStart}
          disabled={!lineCode.trim()}
          className="btn-primary py-6 text-xl uppercase tracking-widest disabled:opacity-20 disabled:grayscale transition-all"
        >
          Iniciar Operação
        </button>
        <p className="text-[8px] text-center text-white/20 font-bold uppercase tracking-widest">
          Certifique-se de que o GPS está ativo no console do veículo
        </p>
      </div>

      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px] -z-10" />
    </main>
  );
}
