"use client";

import { useEffect, useState } from 'react';

interface LineSelectionProps {
  selectedStop: any;
  token?: string;
  onSelect: (line: string) => void;
  falar: (texto: string) => void;
  vibrar: (ms: number | number[]) => void;
}

export default function LineSelection({ selectedStop, token, onSelect, falar, vibrar }: LineSelectionProps) {
  const [lines, setLines] = useState<{ numero: string; destino: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLines() {
      if (!selectedStop?.id) return;
      
      try {
        setLoading(true);
        // Busca linhas REAIS vinculadas ao ponto no Banco de Dados Postgres
        const res = await fetch(`/api/transit/linhas/ponto/${selectedStop.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.linhas && data.linhas.length > 0) {
            const fetchedLines = data.linhas.map((l: any) => ({
              numero: l.codigo,
              destino: l.nome || 'Destino Padrão'
            }));
            setLines(fetchedLines);
            const numeros = fetchedLines.map((l: any) => l.numero).join(', ');
            falar(`No ponto ${selectedStop?.nomeDescricao} passam os ônibus: ${numeros}. Qual você deseja pegar?`);
            setLoading(false);
            return;
          }
        }
        
        // Se a API não retornar nada para esse ponto, usar os fallbacks apenas para a pessoa não ficar travada (MVP)
        throw new Error("Sem linhas na API para este ponto");
      } catch (err) {
        console.warn("Usando linhas de fallback...", err);
        const fallbackLines = [
          { numero: '51',   destino: 'Pampulha / Centro' },
          { numero: '61',   destino: 'Venda Nova / Centro' },
          { numero: '83D',  destino: 'Santa Tereza / Centro' },
          { numero: '9502', destino: 'Venda Nova / Sabará' },
          { numero: '411C', destino: 'Centro / Contagem' },
        ];
        setLines(fallbackLines);
        falar(`No ponto ${selectedStop?.nomeDescricao} passam algumas opções padrão. Escolha a sua.`);
        setLoading(false);
      }
    }

    fetchLines();
  }, [selectedStop, falar]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-6">
        <div className="w-24 h-24 border-8 border-[#FFCC00] border-t-transparent rounded-full animate-spin" />
        <p className="text-3xl font-black uppercase text-[#FFCC00] text-center">Carregando linhas reais...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="bg-[#111] border-[8px] border-[#FFCC00] p-6 rounded-[2.5rem]">
        <p className="text-lg uppercase font-black text-[#FFCC00] tracking-widest mb-2">🚏 Você vai embarcar em:</p>
        <p className="text-3xl font-black text-white leading-tight">{selectedStop?.nomeDescricao}</p>
      </div>

      <h2 className="text-3xl font-black text-white">Escolha o número do seu ônibus:</h2>

      <div className="flex flex-col gap-4">
        {lines.map(line => (
          <button
            key={line.numero}
            onClick={() => {
              vibrar([100, 50, 200]);
              falar(`Ônibus selecionado: linha ${line.numero}, sentido ${line.destino}`);
              onSelect(line.numero);
            }}
            className="bg-[#111] border-[6px] border-[#333] p-6 rounded-[2rem] flex items-center gap-6 active:border-[#FFCC00] active:bg-[#1a1a00] transition-all"
            aria-label={`Selecionar ônibus linha ${line.numero} sentido ${line.destino}`}
          >
            <div className="w-24 h-24 bg-[#FFCC00] rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-black">
              <span className="text-black font-black text-3xl">{line.numero}</span>
            </div>
            <div className="text-left">
              <p className="text-white font-black text-2xl leading-tight">{line.destino}</p>
              <p className="text-gray-400 font-bold text-base mt-1">Toque para selecionar este ônibus</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
