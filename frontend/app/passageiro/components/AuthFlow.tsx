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
  step, phone, setPhone, otp, setOtp, onRequestOtp, onValidateOtp, onStartFaceId 
}: AuthFlowProps) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-8 animate-in fade-in duration-500">
      {step === 'phone_input' && (
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-black leading-tight">Para começar, qual seu telefone?</h1>
          <input 
            type="tel" 
            placeholder="(00) 00000-0000"
            className="bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-3xl font-mono focus:border-blue-500 outline-none transition-all"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            onClick={onRequestOtp}
            className="bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl text-2xl font-black transition-all shadow-lg active:scale-95"
          >
            Receber Código
          </button>
          
          <div className="flex items-center gap-4 my-2 opacity-20">
            <div className="flex-1 h-px bg-white" />
            <span className="text-xs font-black uppercase">ou</span>
            <div className="flex-1 h-px bg-white" />
          </div>

          <button 
            onClick={onStartFaceId}
            className="bg-white/5 border-2 border-white/10 hover:bg-white/10 py-6 rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95"
          >
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 14a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            <span className="text-xl font-bold">Usar Face ID</span>
          </button>
        </div>
      )}

      {step === 'otp_input' && (
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-black">Digite o código enviado</h1>
          <input 
            type="number" 
            placeholder="000000"
            className="bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-5xl font-mono text-center tracking-[1rem] focus:border-green-500 outline-none transition-all"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button 
            onClick={onValidateOtp}
            className="bg-green-600 hover:bg-green-500 py-6 rounded-3xl text-2xl font-black shadow-lg active:scale-95"
          >
            Confirmar Acesso
          </button>
        </div>
      )}
    </div>
  );
}
