"use client";

interface RouteSetupProps {
  lineCode: string;
  setLineCode: (val: string) => void;
  onStart: () => void;
}

export default function RouteSetup({ lineCode, setLineCode, onStart }: RouteSetupProps) {
  // Linhas de ônibus reais de Minas Gerais (Belo Horizonte e Região Metropolitana)
  const busLines = [
    '51', '61', '63', '64', '83D', '5106', '9502', '30', '411C', '1502',
    '2580', '2590', '2950', '8151', '9801', '2101', '9209', '901', '9407', '4988'
  ];

  return (
    <main className="min-h-dvh bg-black flex flex-col items-center justify-start p-6 pt-12 gap-8 animate-in fade-in duration-700 pb-16">
      
      {/* Branding Gigante */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center bg-[#222] border-8 border-brand-primary">
          <span className="text-7xl">🚍</span>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Terminal do <span className="text-brand-primary block mt-2">Motorista</span></h1>
        </div>
      </div>

      <div className="w-full flex flex-col gap-6 mt-4">
        <h2 className="text-4xl font-black text-brand-primary text-center mb-2 uppercase">Selecione sua Linha</h2>
        
        <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[50vh] pr-2 pb-6 custom-scrollbar">
          {busLines.map((line) => (
            <button
              key={line}
              onClick={() => setLineCode(line)}
              className={`py-12 rounded-[2.5rem] border-[6px] text-5xl font-black uppercase transition-all shadow-xl ${
                lineCode === line 
                  ? 'bg-brand-primary border-brand-primary text-black scale-105'
                  : 'bg-[#111] border-brand-primary/50 text-white hover:bg-[#222] hover:border-brand-primary active:bg-brand-primary active:text-black'
              }`}
            >
              {line}
            </button>
          ))}
        </div>

        <button 
          onClick={onStart}
          disabled={!lineCode.trim()}
          className="w-full py-8 mt-4 rounded-full bg-blue-600 border-8 border-blue-800 text-white text-4xl font-black uppercase tracking-widest disabled:opacity-20 disabled:grayscale active:bg-blue-700 transition-all shadow-2xl"
        >
          Iniciar Viagem
        </button>
      </div>

    </main>
  );
}
