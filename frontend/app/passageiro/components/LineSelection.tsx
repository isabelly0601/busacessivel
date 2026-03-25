"use client";

interface LineSelectionProps {
  selectedStop: any;
  onSelect: (line: string) => void;
}

export default function LineSelection({ selectedStop, onSelect }: LineSelectionProps) {
  const commonLines = ['340', '51A', '82', '5102', 'Express'];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 p-8 rounded-3xl">
        <p className="text-xs uppercase font-black text-[#3b82f6] tracking-widest mb-2">Local de Embarque</p>
        <p className="text-2xl font-black">{selectedStop.nomeDescricao}</p>
      </div>

      <h1 className="text-3xl font-black leading-tight">Qual ônibus você deseja pegar?</h1>
      
      <div className="grid grid-cols-2 gap-4">
         {commonLines.map(line => (
           <button 
            key={line}
            onClick={() => onSelect(line)}
            className="bg-white/5 border-2 border-white/10 py-10 rounded-4xl text-3xl font-black hover:bg-white/10 active:bg-[#3b82f6] active:border-[#3b82f6] transition-all"
           >
             {line}
           </button>
         ))}
      </div>
    </div>
  );
}
