"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    falar('Entrando na sua conta...');
    // Fake login for now
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('user_token', 'logged_in');
      router.push('/passageiro');
    }, 1500);
  };

  const handleGoogleAuth = () => {
    falar('O login pelo Google requer configuração das chaves oficiais. No momento, está em modo de teste.');
    alert('O Google Auth está preparado para quando as credenciais do Cloud Console forem adicionadas.');
  };

  return (
    <main className="min-h-[100dvh] flex flex-col p-6" style={{ backgroundColor: '#000', color: '#fff' }}>
      <header className="flex justify-between items-center pt-8 pb-4">
        <button 
          onClick={() => { falar('Voltar'); router.back(); }}
          className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center active:bg-[#333]"
          aria-label="Voltar para a tela anterior"
        >
          <ArrowLeft color="#FFCC00" size={24} />
        </button>
        <button 
          onClick={() => falar('Tela de acesso. Digite seu email e senha para entrar, ou acesse pelo Google.')}
          className="w-12 h-12 bg-[#FFCC00] rounded-full flex items-center justify-center active:bg-[#E6B800]"
          aria-label="Ouvir instruções da tela de acesso"
        >
          <Volume2 color="#000" size={24} strokeWidth={3} />
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-4xl font-black text-[#FFCC00] tracking-tight mb-2">Acesse sua conta</h1>
        <p className="text-gray-400 font-bold mb-8">E salve suas rotas e locais favoritos</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-bold text-gray-300 mb-2">E-mail</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-[#111] border-2 border-[#333] p-4 rounded-2xl text-white text-lg focus:border-[#FFCC00] focus:outline-none transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="senha" className="text-sm font-bold text-gray-300 mb-2">Senha</label>
            <input 
              id="senha"
              type="password" 
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="bg-[#111] border-2 border-[#333] p-4 rounded-2xl text-white text-lg focus:border-[#FFCC00] focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFCC00] text-black font-black text-2xl py-5 rounded-full active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-[2px] bg-[#333]"></div>
          <span className="text-gray-500 font-bold">OU</span>
          <div className="flex-1 h-[2px] bg-[#333]"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-4 bg-white text-black font-black text-xl py-5 rounded-full active:scale-95 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Entrar com Google
        </button>

      </div>
    </main>
  );
}
