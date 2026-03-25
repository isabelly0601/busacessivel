"use client";

interface RouteSetupProps {
  lineCode: string;
  setLineCode: (val: string) => void;
  onStart: () => void;
}

export default function RouteSetup({ lineCode, setLineCode, onStart }: RouteSetupProps) {
  return (
    <main className="min-h-dvh bg-black flex flex-col items-center justify-center p-8 gap-8 animate-in fade-in duration-700">
      <h1 className="text-4xl font-black text-center uppercase tracking-tight">Frotas Bus Acessível</h1>
      <div className="w-full max-w-sm flex flex-col gap-4">
        <p className="text-white/50 font-bold uppercase tracking-widest text-xs text-center">Informe a sua Linha</p>
        <input 
          type="text" 
          placeholder="Ex: 340"
          className="bg-white/10 border-2 border-white/20 rounded-3xl p-6 text-center text-4xl font-black focus:border-[#f59e0b] outline-none transition-all placeholder:text-white/10"
          value={lineCode}
          onChange={(e) => setLineCode(e.target.value)}
        />
        <button 
          onClick={onStart}
          disabled={!lineCode.trim()}
          className="bg-[#f59e0b] disabled:opacity-30 py-6 rounded-3xl text-black text-2xl font-black uppercase shadow-lg active:scale-95 transition-all"
        >
          Iniciar Rota
        </button>
      </div>
    </main>
  );
}
