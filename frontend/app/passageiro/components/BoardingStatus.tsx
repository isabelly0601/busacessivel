"use client";

import DigitalTicket from './DigitalTicket';

interface BoardingStatusProps {
  step: 'awaiting_arrival' | 'approaching' | 'arrived';
  line: string;
  stopName: string;
  solicitacaoId: string;
}

export default function BoardingStatus({ step, line, stopName, solicitacaoId }: BoardingStatusProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-10 animate-in zoom-in-95 duration-500 pb-10">
      {step === 'awaiting_arrival' ? (
        <>
          <div className="w-64 h-64 rounded-full bg-[#111] border-[12px] border-brand-primary flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(255,183,0,0.5)]">
             <span className="text-9xl">⏳</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-black uppercase tracking-tight text-brand-primary">Esperando</h1>
            <p className="text-3xl text-white px-4 font-bold leading-relaxed">
              Você vai pegar a linha <br/><span className="text-5xl text-brand-primary font-black my-2 block">{line}</span> 
              no ponto <br/><span className="text-4xl text-brand-primary font-black mt-2 block">{stopName}</span>
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-full flex flex-col items-center gap-10">
            <div className="space-y-4 bg-orange-500 w-full p-6 rounded-3xl border-8 border-orange-700 animate-pulse">
              <h1 className="text-5xl font-black text-black tracking-tighter uppercase">ESTÁ CHEGANDO!</h1>
              <p className="text-3xl font-black text-black">Prepare o QR Code</p>
            </div>
            
            <DigitalTicket 
              solicitacaoId={solicitacaoId} 
              linha={line} 
              ponto={stopName} 
            />
            
            <div className="bg-[#222] border-4 border-white p-6 rounded-2xl w-full">
              <p className="text-2xl font-black text-white leading-snug">Aproxime a tela ao entrar no ônibus.</p>
            </div>
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
