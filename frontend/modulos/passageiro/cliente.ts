// modulos/passageiro/cliente.ts
// Hooks do domínio Passageiro

import { useState, useCallback } from 'react';
import { useMemo } from 'react';
import { OnibusItem, FiltroSentido, LINHAS_DISPONIVEIS, filtrarLinhas } from './modelo';

export function useLinhas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroSentido, setFiltroSentido] = useState<FiltroSentido>('TODOS');

  const onibusFiltrados = useMemo(
    () => filtrarLinhas(LINHAS_DISPONIVEIS, searchQuery, filtroSentido),
    [searchQuery, filtroSentido]
  );

  return {
    linhas: LINHAS_DISPONIVEIS,
    onibusFiltrados,
    searchQuery,
    setSearchQuery,
    filtroSentido,
    setFiltroSentido,
  };
}

export function useLinhasSolicitadas() {
  const [solicitados, setSolicitados] = useState<Set<string>>(new Set());

  const marcarSolicitado = useCallback((linha: string) => {
    setSolicitados(prev => new Set(prev).add(linha));
  }, []);

  const jaSolicitou = useCallback(
    (linha: string) => solicitados.has(linha),
    [solicitados]
  );

  return { solicitados, marcarSolicitado, jaSolicitou };
}
