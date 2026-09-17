"use client";

import { useEffect, useRef, useState } from 'react';

interface FaceIdScannerProps {
  onComplete: () => void;
}

export default function FaceIdScanner({ onComplete }: FaceIdScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 600, height: 600 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        // Fallback para permitir o demo sem câmera se necessário
        setStreamActive(false);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-16 py-10">
      <div className="relative w-[350px] h-[350px]">
        
        {/* Camera Container */}
        <div className="absolute inset-0 rounded-full overflow-hidden border-[12px] border-brand-primary bg-black shadow-[0_0_80px_rgba(255,183,0,0.4)]">
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             muted 
             className="w-full h-full object-cover scale-x-[-1] opacity-90"
           />
           {!streamActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1c]">
                 <div className="w-20 h-20 border-8 border-brand-primary border-t-transparent rounded-full animate-spin" />
              </div>
           )}
        </div>

        {/* Scanning Line */}
        <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-scan shadow-[0_0_20px_rgba(255,183,0,0.8)] z-20" />
        
        {/* Success Checkmark Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 animate-reveal z-30">
           <svg className="w-48 h-48 text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
           </svg>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-4xl font-black uppercase tracking-widest text-brand-primary animate-pulse">
           {streamActive ? 'Reconhecendo...' : 'Iniciando...'}
        </p>
      </div>

      <button 
        onClick={onComplete}
        className="mt-8 bg-[#222] border-4 border-white text-white px-16 py-6 rounded-full text-3xl font-black uppercase hover:bg-white hover:text-black active:bg-brand-primary active:text-black transition-all shadow-xl"
      >
        SIMULAR
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
          animation: reveal 0.5s 0.2s forwards ease-out;
        }
      `}</style>
    </div>
  );
}
