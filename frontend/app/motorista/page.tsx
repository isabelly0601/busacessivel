"use client";

import { useState, useEffect } from 'react';

type Chamado = { id: number; ponto: string; linha: string; status: string };

export default function Motorista() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChamados = async () => {
    try {
      const res = await fetch('http://localhost:3001/chamados/pendentes');
      if (res.ok) setChamados(await res.json());
    } catch { /* no-op */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchChamados();
    const iv = setInterval(fetchChamados, 3000);
    return () => clearInterval(iv);
  }, []);

  const aceitar = async (id: number) => {
    await fetch(`http://localhost:3001/chamados/${id}/aceitar`, { method: 'PUT' }).catch(() => {});
    fetchChamados();
  };

  return (
    <main className="flex flex-col min-h-dvh bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 border-b border-white/5">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Painel do Motorista</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]" />
              </span>
              <span className="text-sm font-semibold text-white/40">Receptor ativo</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Alertas</p>
            <p className={`text-3xl font-black ${chamados.length > 0 ? 'text-[#f59e0b]' : 'text-white/20'}`}>
              {chamados.length}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : chamados.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white/30">Nenhum alerta no momento</h2>
            <p className="text-base text-white/20 max-w-xs">O painel atualizará automaticamente quando um passageiro PCD solicitar embarque na sua rota.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chamados.map((c) => (
              <div
                key={c.id}
                className="relative rounded-2xl border border-[#f59e0b]/20 bg-[#141414] overflow-hidden"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f59e0b]" />

                <div className="p-6 pl-8">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444]" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-[#ef4444]">
                      Embarque PCD
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Localização</p>
                      <p className="text-xl font-bold text-white">{c.ponto}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Linha Solicitada</p>
                      <p className="text-2xl font-black text-[#f59e0b]">{c.linha}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => aceitar(c.id)}
                    className="w-full py-5 rounded-xl bg-white text-black text-lg font-black uppercase tracking-wider active:scale-[0.98] transition-transform"
                  >
                    Ciente — Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
