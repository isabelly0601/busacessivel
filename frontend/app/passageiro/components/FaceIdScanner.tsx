"use client";

interface FaceIdScannerProps {
  onComplete: () => void;
}

export default function FaceIdScanner({ onComplete }: FaceIdScannerProps) {
  return (
    <div className="flex flex-col items-center gap-12 animate-in fade-in duration-500">
      <div className="relative w-64 h-64">
        {/* Outer Frame */}
        <div className="absolute inset-0 border-4 border-white/10 rounded-[3rem]" />
        
        {/* Scanning Line */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10" />
        
        {/* Face Icon Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
           <svg className="w-40 h-40 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
           </svg>
        </div>

        {/* Success Checkmark (hidden initially) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 animate-reveal">
           <svg className="w-32 h-32 text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
           </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-2xl font-black uppercase tracking-widest text-white/40 animate-pulse">Autenticando...</p>
        <p className="text-sm font-bold text-blue-500/50">Mantenha o rosto visível</p>
      </div>

      <button 
        onClick={onComplete}
        className="mt-4 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10"
      >
        Simular Sucesso
      </button>

      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes reveal {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scan {
          animation: scan 2s infinite ease-in-out;
        }
        .animate-reveal {
          animation: reveal 0.5s 2.5s forwards ease-out;
        }
      `}</style>
    </div>
  );
}
