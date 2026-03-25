"use client";

interface StopSelectionProps {
  stops: any[];
  onSelect: (stop: any) => void;
}

export default function StopSelection({ stops, onSelect }: StopSelectionProps) {
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">
      <h1 className="text-2xl font-black text-white/40 uppercase tracking-widest">Selecione o Ponto</h1>
      {stops.length > 0 ? (
        <div className="grid gap-4">
          {stops.map(stop => (
            <button 
              key={stop.id}
              onClick={() => onSelect(stop)}
              className="bg-white/5 border-2 border-white/10 p-8 rounded-4xl text-left hover:bg-white/10 active:border-[#3b82f6] transition-all group"
            >
              <p className="text-2xl font-black group-active:text-[#3b82f6]">{stop.nomeDescricao}</p>
              <p className="text-[#3b82f6] font-bold text-sm mt-2 uppercase tracking-tight">Toque para selecionar este ponto</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center gap-4 opacity-30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xl font-bold italic">Buscando pontos próximos...</p>
        </div>
      )}
    </div>
  );
}
