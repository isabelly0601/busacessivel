"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, Navigation, Loader2 } from 'lucide-react';

export default function LinhaDetalhesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [solicitado, setSolicitado] = useState(false);
  const [loading, setLoading] = useState(false);
  const linhaId = params?.id || '302';

  const falar = (texto: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      window.speechSynthesis.speak(u);
    }
  };

  const handleSolicitar = async () => {
    setLoading(true);
    falar(`Solicitando parada para a linha ${linhaId}.`);
    try {
      const res = await fetch('/api/boarding/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoLinhaDesejada: linhaId,
          nomePassageiro: 'Passageiro PCD',
          pontoDescricao: 'Ponto próximo (GPS)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSolicitado(true);
        falar(`Parada solicitada. Aguarde a chegada do ônibus.`);
        // redirect to map view for this request
        router.push(`/passageiro/mapa/${data.id}`);
      } else {
        falar(`Erro ao solicitar a linha ${linhaId}.`);
        alert('Erro ao solicitar parada.');
      }
    } catch {
      falar('Erro de conexão com o servidor.');
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const proximos = [
    { tempo: '3 min', paradas: '2 paradas' },
    { tempo: '15 min', paradas: '7 paradas' },
    { tempo: '27 min', paradas: '12 paradas' },
  ];

  return (
    <main className="min-h-dvh flex flex-col p-6 bg-[#000] text-white">
      {/* HEADER */}
      <header className="flex justify-between items-center pt-8 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { falar('Voltar'); router.back(); }}
            className="active:opacity-50 transition-opacity"
            aria-label="Voltar"
          >
            <ArrowLeft color="#fff" size={28} />
          </button>
          <h1 className="text-xl font-bold">Linha {linhaId}</h1>
        </div>
        <button 
          onClick={() => falar(`Detalhes da linha ${linhaId}, sentido Centro Terminal. Os próximos ônibus chegam em 3, 15 e 27 minutos.`)}
          className="active:opacity-50 transition-opacity"
          aria-label="Ouvir instruções"
        >
          <Volume2 color="#fff" size={28} />
        </button>
      </header>

      {/* TÍTULO */}
      <div className="mt-4 mb-8">
        <h2 className="text-4xl font-black text-white">Centro / Terminal</h2>
      </div>

      {/* PRÓXIMOS ÔNIBUS */}
      <div className="flex-1">
        <h3 className="text-[#FFCC00] font-black uppercase tracking-wider mb-4">Próximos ônibus</h3>
        <div className="flex flex-col gap-4">
          {proximos.map((item, index) => (
            <div 
              key={index}
              className="flex justify-between items-center bg-[#111] border border-[#222] p-5 rounded-2xl"
            >
              <div>
                <p className="font-bold text-lg text-white">Chega em {item.tempo}</p>
                <p className="text-gray-400 text-sm mt-1">Ônibus a {item.paradas} de você</p>
              </div>
              <button 
                onClick={() => falar(`Chega em ${item.tempo}, a ${item.paradas} de você.`)}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#222] active:bg-[#333]"
                aria-label={`Ouvir detalhes da chegada`}
              >
                <Volume2 color="#fff" size={24} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="pt-6 pb-2 flex flex-col gap-4">
        <button 
          onClick={handleSolicitar}
          disabled={loading || solicitado}
          className={`w-full text-black font-black text-xl py-5 rounded-[2rem] flex justify-center items-center gap-3 active:scale-95 transition-all ${
            solicitado 
              ? 'bg-green-700 text-green-100 opacity-85 cursor-default'
              : 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin text-black" size={24} />
          ) : solicitado ? (
            '✓ Solicitado'
          ) : (
            <>
              <Volume2 fill="#000" size={24} /> Solicitar Parada
            </>
          )}
        </button>

        <button 
          onClick={() => router.push(`/passageiro/navegacao?linha=${linhaId}`)}
          className="w-full bg-[#FFCC00] text-[#000] font-black text-xl py-5 rounded-[2rem] flex justify-center items-center gap-3 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)]"
        >
          <Navigation fill="#000" size={24} /> Iniciar navegação
        </button>
      </div>

    </main>
  );
}
