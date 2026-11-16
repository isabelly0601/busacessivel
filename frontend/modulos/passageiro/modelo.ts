// modulos/passageiro/modelo.ts
// Tipos puros do domínio Passageiro e catálogo completo de Belo Horizonte

import { TODAS_LINHAS_BH, LinhaBH } from '../../compartilhado/linhas-bh';

export type SentidoOnibus = 'Centro' | 'Bairro';

export interface OnibusItem extends LinhaBH {}

export type FiltroSentido = 'TODOS' | SentidoOnibus;

// Lista completa oficial das linhas de Belo Horizonte
export const LINHAS_DISPONIVEIS: OnibusItem[] = TODAS_LINHAS_BH;

// Regras de negócio puras
export function filtrarLinhas(
  lista: OnibusItem[],
  query: string,
  sentido: FiltroSentido
): OnibusItem[] {
  return lista.filter(item => {
    const q = query.toLowerCase().trim();
    const matchText =
      !q ||
      item.linha.toLowerCase().includes(q) ||
      item.destino.toLowerCase().includes(q) ||
      (item.categoria && item.categoria.toLowerCase().includes(q));
    const matchSentido = sentido === 'TODOS' || item.sentido === sentido;
    return matchText && matchSentido;
  });
}
