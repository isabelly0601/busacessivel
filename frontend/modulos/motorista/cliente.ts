// modulos/motorista/cliente.ts
// Hooks e chamadas HTTP do domínio Motorista

import { useState, useEffect, useRef, useCallback } from 'react';
import { Alerta } from './modelo';
import { obterGps } from '../../compartilhado/gps';
import { httpGet, httpPatch } from '../../compartilhado/http';

const POLLING_INTERVAL_MS = 3000;

export function useGpsMotorista(ativo: boolean) {
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAtivo, setGpsAtivo] = useState(false);

  useEffect(() => {
    if (!ativo) return;
    // Fallback simulado para BH caso GPS seja bloqueado
    setGpsAtivo(true);
    setLocalizacao({ lat: -19.9167, lng: -43.9345 });

    const parar = obterGps(
      (c) => { setLocalizacao(c); setGpsAtivo(true); },
      () => { setGpsAtivo(true); } // mantém simulado
    );
    return parar;
  }, [ativo]);

  return { localizacao, gpsAtivo };
}

export function useAlertas(
  linhaCode: string,
  localizacao: { lat: number; lng: number } | null,
  emViagem: boolean,
  onNovoAlerta: (alerta: Alerta) => void
) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const qtdAnterior = useRef(0);

  const buscarAlertas = useCallback(async () => {
    if (!emViagem || !linhaCode) return;
    try {
      const lat = localizacao?.lat ?? 0;
      const lng = localizacao?.lng ?? 0;
      const data = await httpGet<{ solicitacoes: Alerta[] }>(
        `/telemetry/alertas?linha=${encodeURIComponent(linhaCode)}&lat=${lat}&lng=${lng}`
      );
      const lista = data.solicitacoes || [];
      setAlertas(lista);
      if (lista.length > qtdAnterior.current && lista.length > 0) {
        onNovoAlerta(lista[lista.length - 1]);
      }
      qtdAnterior.current = lista.length;
    } catch (err) {
      console.error('[motorista] Erro ao buscar alertas:', err);
    }
  }, [emViagem, linhaCode, localizacao, onNovoAlerta]);

  useEffect(() => {
    buscarAlertas();
    const iv = setInterval(buscarAlertas, POLLING_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [buscarAlertas]);

  const notificarChegada = useCallback(async (id: string) => {
    await httpPatch(`/telemetry/notificar/${id}`);
    setAlertas(prev => prev.filter(a => a.id !== id));
    qtdAnterior.current = Math.max(0, qtdAnterior.current - 1);
  }, []);

  return { alertas, notificarChegada };
}
