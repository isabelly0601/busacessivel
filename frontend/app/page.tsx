import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col min-h-dvh p-5 gap-5">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-5xl font-black tracking-tight">
          Ponto<span className="text-[#3b82f6]">MB</span>
        </h1>
        <p className="mt-3 text-lg text-[#a0a0a0] font-semibold">Embarque acessível e seguro</p>
      </header>

      {/* Selection Cards */}
      <div className="flex-1 flex flex-col gap-5 max-w-lg w-full mx-auto">
        <Link
          href="/passageiro"
          className="flex-1 flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#1a2744] border-2 border-[#3b82f6]/40 p-10 transition-transform active:scale-[0.97] min-h-[35vh]"
          aria-label="Acessar como passageiro com deficiência visual"
        >
          <svg className="w-20 h-20 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 100 4 2 2 0 000-4zM10.5 7C8.57 7 7 8.57 7 10.5V14a1 1 0 002 0v-2h6v2a1 1 0 002 0v-3.5C17 8.57 15.43 7 13.5 7h-3zM9 15l-1.5 6a1 1 0 001.94.5L11 17h2l1.56 4.5a1 1 0 001.94-.5L15 15H9z"/>
          </svg>
          <span className="text-3xl font-black text-white uppercase tracking-wider text-center">
            Sou Passageiro
          </span>
          <span className="text-base text-[#7ba4db] font-semibold text-center">
            Embarque assistido por voz
          </span>
        </Link>

        <Link
          href="/motorista"
          className="flex-1 flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#1a1a1a] border-2 border-[#f59e0b]/30 p-10 transition-transform active:scale-[0.97] min-h-[35vh]"
          aria-label="Acessar como motorista"
        >
          <svg className="w-20 h-20 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 16h1v3a1 1 0 002 0v-3h10v3a1 1 0 002 0v-3h1a2 2 0 002-2V8l-3-6H5L2 8v6a2 2 0 002 2zM5.81 4h12.38l2 4H3.81l2-4zM6.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
          </svg>
          <span className="text-3xl font-black text-white uppercase tracking-wider text-center">
            Sou Motorista
          </span>
          <span className="text-base text-[#c4a35a] font-semibold text-center">
            Receba alertas de embarque
          </span>
        </Link>
      </div>

      {/* Admin Link */}
      <footer className="mt-auto py-8 text-center">
        <Link 
          href="/admin" 
          className="text-xs font-black uppercase tracking-[0.3em] text-white/20 hover:text-[#3b82f6] transition-colors"
        >
          Painel Administrativo
        </Link>
      </footer>
    </main>
  );
}
