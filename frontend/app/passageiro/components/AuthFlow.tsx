"use client";

interface AuthFlowProps {
  step: 'phone_input' | 'otp_input';
  phone: string;
  setPhone: (val: string) => void;
  otp: string;
  setOtp: (val: string) => void;
  onRequestOtp: () => void;
  onValidateOtp: () => void;
  onStartFaceId: () => void;
}

export default function AuthFlow({ 
  onStartFaceId 
}: { onStartFaceId: () => void }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-10">
        <h1 className="text-5xl font-black leading-tight text-center text-brand-primary">Acesso<br/>Biométrico</h1>
        
        <button 
          onClick={onStartFaceId}
          className="flex-1 flex flex-col items-center justify-center gap-10 bg-brand-primary text-black rounded-[48px] p-16 shadow-2xl active:scale-95 transition-all group border-8 border-white/20"
          aria-label="Toque aqui para iniciar o reconhecimento facial"
        >
          <div className="w-48 h-48 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-32 h-32 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 14a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <span className="text-5xl font-black uppercase tracking-tighter text-black text-center">Tocar aqui</span>
          <p className="text-2xl font-bold text-black/80 text-center leading-relaxed">Para ler o seu rosto</p>
        </button>

        <p className="text-center text-white font-black uppercase tracking-widest text-lg bg-[#222] p-4 rounded-xl border-2 border-white/20">
          PROTEGIDO POR BIOMETRIA
        </p>
      </div>
    </div>
  );
}
