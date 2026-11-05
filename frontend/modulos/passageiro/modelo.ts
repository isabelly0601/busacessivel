// modulos/passageiro/modelo.ts
// Tipos puros do domínio Passageiro — sem dependência de banco, rede ou UI

export type SentidoOnibus = 'Centro' | 'Bairro';

export interface OnibusItem {
  linha: string;
  destino: string;
  sentido: SentidoOnibus;
  tempoMin: number;
  distancia: string;
  isRealtime: boolean;
}

export type FiltroSentido = 'TODOS' | SentidoOnibus;

// Lista oficial das linhas disponíveis (regra de negócio pura)
export const LINHAS_DISPONIVEIS: OnibusItem[] = [
  { linha: '8106', destino: 'Belo Vale / Centro',                sentido: 'Centro', tempoMin: 3,  distancia: '450m',   isRealtime: true  },
  { linha: '302',  destino: 'Estação Barreiro / Centro',         sentido: 'Centro', tempoMin: 5,  distancia: '780m',   isRealtime: true  },
  { linha: '51',   destino: 'Estação Pampulha / Centro',         sentido: 'Centro', tempoMin: 7,  distancia: '1.2 km', isRealtime: true  },
  { linha: '61',   destino: 'Estação Venda Nova / Bairro',       sentido: 'Bairro', tempoMin: 10, distancia: '1.8 km', isRealtime: true  },
  { linha: '83D',  destino: 'Estação São Gabriel / Centro',      sentido: 'Centro', tempoMin: 13, distancia: '2.5 km', isRealtime: false },
  { linha: '9502', destino: 'São Geraldo / Madre Gertrudes',     sentido: 'Bairro', tempoMin: 16, distancia: '3.1 km', isRealtime: false },
  { linha: '411C', destino: 'Terminal São Benedito / Centro',    sentido: 'Centro', tempoMin: 20, distancia: '4.0 km', isRealtime: false },
  { linha: '5106', destino: 'Bandeirantes / BH Shopping',        sentido: 'Bairro', tempoMin: 24, distancia: '5.2 km', isRealtime: false },
  { linha: '30',   destino: 'Estação Diamante / Centro',         sentido: 'Centro', tempoMin: 29, distancia: '6.4 km', isRealtime: false },
  { linha: '1502', destino: 'Vista Alegre / Bairro Guarani',     sentido: 'Bairro', tempoMin: 35, distancia: '7.8 km', isRealtime: false },
];

// Regras de negócio puras
export function filtrarLinhas(
  lista: OnibusItem[],
  query: string,
  sentido: FiltroSentido
): OnibusItem[] {
  return lista.filter(item => {
    const matchText =
      item.linha.toLowerCase().includes(query.toLowerCase()) ||
      item.destino.toLowerCase().includes(query.toLowerCase());
    const matchSentido = sentido === 'TODOS' || item.sentido === sentido;
    return matchText && matchSentido;
  });
}
