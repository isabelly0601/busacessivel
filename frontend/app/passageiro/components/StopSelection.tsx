"use client";

import { useEffect, useState, useRef } from 'react';

interface StopSelectionProps {
  stops: any[];
  userLocation: { lat: number; lng: number } | null;
  onSelect: (stop: any) => void;
  falar: (texto: string) => void;
  vibrar: (ms: number | number[]) => void;
}

function calcDistM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

// Pontos reais de BH e Região Metropolitana
const FALLBACK_STOPS = [
  { id: 'bh-01', nomeDescricao: 'Praça Sete - Centro BH',         latitude: -19.9186, longitude: -43.9378 },
  { id: 'bh-02', nomeDescricao: 'Estação Pampulha - BH',          latitude: -19.8560, longitude: -43.9690 },
  { id: 'bh-03', nomeDescricao: 'Terminal Venda Nova - BH',        latitude: -19.7927, longitude: -43.9729 },
  { id: 'bh-04', nomeDescricao: 'Savassi / Funcionários - BH',    latitude: -19.9352, longitude: -43.9387 },
  { id: 'bh-05', nomeDescricao: 'Bairro Santa Tereza - BH',       latitude: -19.9217, longitude: -43.9099 },
  { id: 'bh-06', nomeDescricao: 'Bairro Gutierrez - BH',          latitude: -19.9363, longitude: -43.9566 },
  { id: 'bh-07', nomeDescricao: 'Alto Vera Cruz - BH',            latitude: -19.9137, longitude: -43.9082 },
  { id: 'bh-08', nomeDescricao: 'Bairro Palmares - BH',           latitude: -19.8650, longitude: -43.9350 },
  { id: 'bh-09', nomeDescricao: 'Bairro Barreiro - BH',           latitude: -20.0146, longitude: -44.0050 },
  { id: 'bh-10', nomeDescricao: 'Conjunto Floramar - BH',         latitude: -19.8020, longitude: -43.9610 },
  { id: 'ct-01', nomeDescricao: 'Centro de Contagem',              latitude: -19.9321, longitude: -44.0537 },
  { id: 'ct-02', nomeDescricao: 'Eldorado - Contagem',             latitude: -19.9554, longitude: -44.0622 },
  { id: 'ct-03', nomeDescricao: 'Industrial - Contagem',           latitude: -19.9461, longitude: -44.0408 },
  { id: 'sb-01', nomeDescricao: 'Centro de Sabará',                latitude: -19.8853, longitude: -43.8262 },
  { id: 'sb-02', nomeDescricao: 'Bairro Fonseca - Sabará',        latitude: -19.8731, longitude: -43.8390 },
  { id: 'bv-01', nomeDescricao: 'Betim - Av. Amazonas',            latitude: -19.9678, longitude: -44.1997 },
  { id: 'sc-01', nomeDescricao: 'Santa Luzia - Centro',            latitude: -19.7735, longitude: -43.8539 },
];

export default function StopSelection({ stops, userLocation, onSelect, falar, vibrar }: StopSelectionProps) {
  const [countdown, setCountdown] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ordena por distância se tiver GPS
  const sortedFallback = userLocation
    ? [...FALLBACK_STOPS].sort((a, b) =>
        calcDistM(userLocation, { lat: a.latitude, lng: a.longitude }) -
        calcDistM(userLocation, { lat: b.latitude, lng: b.longitude })
      )
    : FALLBACK_STOPS;

  const currentStops = stops.length > 0 ? stops : sortedFallback;
  const nearest = currentStops[0];

  useEffect(() => {
    if (!nearest || autoSelected || showAll) return;
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setAutoSelected(true);
          vibrar([100, 50, 200]);
          falar(`Ponto selecionado: ${nearest.nomeDescricao}`);
          onSelect(nearest);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [nearest, autoSelected, showAll, onSelect, vibrar, falar]);

  if (!showAll) {
    const distM = userLocation && nearest?.latitude
      ? calcDistM(userLocation, { lat: nearest.latitude, lng: nearest.longitude })
      : null;

    return (
      <div className="flex flex-col gap-6">
        <p className="text-xl font-bold text-gray-400 text-center uppercase tracking-widest">📡 Ponto Sugerido pelo GPS</p>

        <div className="bg-[#111] border-[8px] border-[#FFCC00] p-8 rounded-[3rem] text-center">
          <p className="text-lg font-black uppercase text-[#FFCC00] tracking-widest mb-3">📍 Ponto mais próximo de você</p>
          <p className="text-4xl font-black text-white leading-tight mb-3">{nearest?.nomeDescricao}</p>
          {distM !== null && (
            <p className="text-2xl font-black text-gray-400">
              A <span className="text-white text-3xl">{distM < 1000 ? `${distM} metros` : `${(distM/1000).toFixed(1)} km`}</span> de você
            </p>
          )}
        </div>

        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setAutoSelected(true);
            vibrar([100, 50, 200]);
            onSelect(nearest);
          }}
          className="w-full bg-[#FFCC00] py-10 rounded-[3rem] text-black font-black text-3xl uppercase tracking-widest active:scale-95 transition-all relative overflow-hidden"
          aria-label={`Confirmar embarque no ponto ${nearest?.nomeDescricao}`}
        >
          <span className="block">✅ EMBARCAR NESTE PONTO</span>
          <span className="block text-xl mt-2 text-black/60">
            Confirmando em <span className="font-black text-2xl text-black">{countdown}s</span>
          </span>
          <div
            className="absolute bottom-0 left-0 h-3 bg-black/30 transition-all duration-1000"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </button>

        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setShowAll(true);
            falar('Mostrando todos os pontos disponíveis. Escolha o seu ponto de ônibus.');
          }}
          className="w-full bg-[#111] border-[6px] border-[#FFCC00] py-8 rounded-[3rem] text-[#FFCC00] font-black text-2xl uppercase tracking-widest active:bg-[#222] transition-all"
          aria-label="Ver todos os pontos de ônibus disponíveis"
        >
          🔍 VER TODOS OS PONTOS DISPONÍVEIS
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => { setShowAll(false); falar('Voltando para o ponto mais próximo.'); }}
        className="bg-[#111] border-[4px] border-[#333] py-5 rounded-2xl text-white font-black text-xl uppercase active:bg-[#222] transition-all"
        aria-label="Voltar para o ponto sugerido pelo GPS"
      >
        ← Voltar ao Ponto Sugerido pelo GPS
      </button>

      <h2 className="text-2xl font-black text-[#FFCC00] uppercase text-center">Escolha seu ponto de ônibus:</h2>

      {currentStops.map((stop) => {
        const distM = userLocation && stop.latitude
          ? calcDistM(userLocation, { lat: stop.latitude, lng: stop.longitude })
          : null;
        return (
          <button
            key={stop.id}
            onClick={() => {
              vibrar([100, 50, 200]);
              falar(`Ponto selecionado: ${stop.nomeDescricao}`);
              onSelect(stop);
            }}
            className="bg-[#111] border-[6px] border-[#333] p-8 rounded-[2.5rem] text-left active:border-[#FFCC00] transition-all"
            aria-label={`Selecionar ponto: ${stop.nomeDescricao}`}
          >
            <p className="text-3xl font-black text-white leading-tight">🚏 {stop.nomeDescricao}</p>
            {distM !== null && (
              <p className="text-gray-400 font-bold text-xl mt-2">
                📍 A {distM < 1000 ? `${distM} metros` : `${(distM/1000).toFixed(1)} km`} — Toque aqui para selecionar
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
