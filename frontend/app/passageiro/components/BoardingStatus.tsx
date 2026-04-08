"use client";

import DigitalTicket from './DigitalTicket';

interface BoardingStatusProps {
  step: 'awaiting_arrival' | 'approaching';
  line: string;
  stopName: string;
  solicitacaoId: string;
}

export default function BoardingStatus({ step, line, stopName, solicitacaoId }: BoardingStatusProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-10 animate-in zoom-in-95 duration-500">
      {step === 'awaiting_arrival' ? (
        <>
          <div className="w-56 h-56 rounded-full bg-[#3b82f6]/20 border-4 border-[#3b82f6] flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(59,130,246,0.3)]">
             <span className="text-8xl">⏳</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tight">Solicitação Ativa</h1>
            <p className="text-xl text-white/50 px-6 font-medium leading-relaxed">
              Aguardando a linha <span className="text-white font-black">{line}</span> no ponto <span className="text-white font-black">{stopName}</span>.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-full flex flex-col items-center gap-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-orange-400 tracking-tighter italic">ESTÁ CHEGANDO!</h1>
              <p className="text-xl font-bold opacity-60">Prepare seu ticket de embarque</p>
            </div>
            
            <DigitalTicket 
              solicitacaoId={solicitacaoId} 
              linha={line} 
              ponto={stopName} 
            />
            
            <p className="text-sm font-black px-8 opacity-40 leading-snug">Aproxime o QR Code do leitor secundário do ônibus ao embarcar.</p>
          </div>
          
          <style jsx>{`
            @keyframes sonar {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
              70% { transform: scale(1.05); box-shadow: 0 0 0 50px rgba(249, 115, 22, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
            }
            .animate-sonar {
              animation: sonar 1.5s infinite;
            }
          `}</style>
        </>
      )}
    </div>
  );
}
