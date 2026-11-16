// Linhas oficiais de ônibus de Belo Horizonte e Região Metropolitana (Move + Alimentadoras + Diametrais + Circulares)
export interface LinhaBH {
  linha: string;
  destino: string;
  sentido: 'Centro' | 'Bairro';
  tempoMin: number;
  distancia: string;
  isRealtime: boolean;
  categoria?: 'BRT MOVE' | 'TRONCAL' | 'DIAMETRAL' | 'CIRCULAR' | 'ALIMENTADORA';
}

export const TODAS_LINHAS_BH: LinhaBH[] = [
  // ── BRT MOVE / TRONCAIS ──
  { linha: '50', destino: 'Estação Pampulha / Centro - Direta', sentido: 'Centro', tempoMin: 3, distancia: '350m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '51', destino: 'Estação Pampulha / Centro - Paradora', sentido: 'Centro', tempoMin: 4, distancia: '520m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '52', destino: 'Estação Pampulha / Lagoinha', sentido: 'Bairro', tempoMin: 6, distancia: '800m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '61', destino: 'Estação Venda Nova / Centro - Direta', sentido: 'Centro', tempoMin: 5, distancia: '750m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '62', destino: 'Estação Venda Nova / Savassi via Hospitais', sentido: 'Centro', tempoMin: 7, distancia: '1.1 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '63', destino: 'Estação Venda Nova / Centro - Paradora', sentido: 'Centro', tempoMin: 8, distancia: '1.3 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '64', destino: 'Estação Vilarinho / Santo Agostinho via Carlos Luz', sentido: 'Centro', tempoMin: 9, distancia: '1.4 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '65', destino: 'Estação Vilarinho / Centro Direta', sentido: 'Centro', tempoMin: 6, distancia: '900m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '66', destino: 'Estação Vilarinho / Savassi via Hospitais', sentido: 'Centro', tempoMin: 8, distancia: '1.2 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '67', destino: 'Estação Vilarinho / Santo Agostinho', sentido: 'Centro', tempoMin: 11, distancia: '1.7 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '68', destino: 'Estação Vilarinho / Lagoinha', sentido: 'Bairro', tempoMin: 12, distancia: '1.9 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '82', destino: 'Estação São Gabriel / Savassi via Hospitais', sentido: 'Centro', tempoMin: 6, distancia: '950m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '83D', destino: 'Estação São Gabriel / Centro - Direta', sentido: 'Centro', tempoMin: 4, distancia: '600m', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '83P', destino: 'Estação São Gabriel / Centro - Paradora', sentido: 'Centro', tempoMin: 7, distancia: '1.1 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '84', destino: 'Estação São Gabriel / Floresta', sentido: 'Centro', tempoMin: 10, distancia: '1.5 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '85', destino: 'Estação São Gabriel / Centro via Floresta', sentido: 'Centro', tempoMin: 12, distancia: '1.8 km', isRealtime: true, categoria: 'BRT MOVE' },

  // ── LINHAS DIAMETRAIS (TRADICIONAIS) ──
  { linha: '8106', destino: 'Santa Cruz / Belo Vale via Centro', sentido: 'Centro', tempoMin: 2, distancia: '250m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '8102', destino: 'União / Carmo via Mangabeiras', sentido: 'Centro', tempoMin: 5, distancia: '700m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '8108', destino: 'Planalto / Bairro Cidade Nova', sentido: 'Bairro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '8151', destino: 'Estação São Gabriel / Estação Diamante', sentido: 'Bairro', tempoMin: 14, distancia: '2.2 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '8207', destino: 'Maria Goretti / Estrela Dalva', sentido: 'Bairro', tempoMin: 10, distancia: '1.5 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '8208', destino: 'Santa Cruz / Uni-Estoril', sentido: 'Centro', tempoMin: 8, distancia: '1.2 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9101', destino: 'Alto Barroca / Santa Rosa', sentido: 'Bairro', tempoMin: 11, distancia: '1.6 km', isRealtime: false, categoria: 'DIAMETRAL' },
  { linha: '9104', destino: 'Sagrada Família / Luxemburgo', sentido: 'Centro', tempoMin: 6, distancia: '850m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9202', destino: 'Pompéia / Jardim América', sentido: 'Centro', tempoMin: 7, distancia: '980m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9204', destino: 'Santa Efigênia / Estoril', sentido: 'Centro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9206', destino: 'Vera Cruz / Buritis', sentido: 'Centro', tempoMin: 10, distancia: '1.5 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9209', destino: 'Sagrada Família / Gutierrez', sentido: 'Centro', tempoMin: 8, distancia: '1.1 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9250', destino: 'Caetano Furquim / Nova Cintra via Savassi', sentido: 'Centro', tempoMin: 12, distancia: '1.8 km', isRealtime: false, categoria: 'DIAMETRAL' },
  { linha: '9407', destino: 'Alto Vera Cruz / Dom Bosco', sentido: 'Bairro', tempoMin: 13, distancia: '2.0 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9412', destino: 'Taquaril / Padre Eustáquio', sentido: 'Centro', tempoMin: 15, distancia: '2.3 km', isRealtime: false, categoria: 'DIAMETRAL' },
  { linha: '9502', destino: 'São Geraldo / Madre Gertrudes', sentido: 'Bairro', tempoMin: 11, distancia: '1.7 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9801', destino: 'Saudade / Santa Inês', sentido: 'Centro', tempoMin: 8, distancia: '1.2 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '9805', destino: 'Santa Efigênia / Renascença', sentido: 'Centro', tempoMin: 14, distancia: '2.1 km', isRealtime: false, categoria: 'DIAMETRAL' },

  // ── ESTAÇÃO BARREIRO / DIAMANTE ──
  { linha: '30', destino: 'Estação Diamante / Centro via Afonso Pena', sentido: 'Centro', tempoMin: 4, distancia: '600m', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '32', destino: 'Estação Barreiro / Centro via Amazonas', sentido: 'Centro', tempoMin: 5, distancia: '750m', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '33', destino: 'Estação Barreiro / Hospitais', sentido: 'Centro', tempoMin: 7, distancia: '1.0 km', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '35', destino: 'Estação Barreiro / Centro via Praça Sete', sentido: 'Centro', tempoMin: 6, distancia: '900m', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '302', destino: 'Estação Barreiro / Centro - Expresso', sentido: 'Centro', tempoMin: 3, distancia: '480m', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '305', destino: 'Estação Diamante / Mangabeiras', sentido: 'Centro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '3050', destino: 'Estação Diamante / Hospitais via Savassi', sentido: 'Centro', tempoMin: 8, distancia: '1.2 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '3051', destino: 'Flávio Marques Lisboa / Savassi', sentido: 'Centro', tempoMin: 12, distancia: '1.8 km', isRealtime: false, categoria: 'DIAMETRAL' },
  { linha: '3053', destino: 'Estação Barreiro / Barra Funda', sentido: 'Bairro', tempoMin: 10, distancia: '1.5 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '3055', destino: 'Santa Helena / Savassi', sentido: 'Centro', tempoMin: 11, distancia: '1.7 km', isRealtime: true, categoria: 'DIAMETRAL' },

  // ── LINHAS REGIONAIS E ALIMENTADORAS ──
  { linha: '1502', destino: 'Vista Alegre / Bairro Guarani', sentido: 'Bairro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '1505', destino: 'Alto dos Pinheiros / Felicidade', sentido: 'Centro', tempoMin: 7, distancia: '1.0 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '1509', destino: 'California / Tupi', sentido: 'Bairro', tempoMin: 12, distancia: '1.9 km', isRealtime: false, categoria: 'DIAMETRAL' },
  { linha: '2101', destino: 'Grajaú / Sion', sentido: 'Centro', tempoMin: 6, distancia: '800m', isRealtime: true, categoria: 'CIRCULAR' },
  { linha: '2102', destino: 'Gameleira / Serra', sentido: 'Centro', tempoMin: 8, distancia: '1.1 km', isRealtime: true, categoria: 'CIRCULAR' },
  { linha: '2103', destino: 'Prado / Anchieta', sentido: 'Centro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'CIRCULAR' },
  { linha: '2104', destino: 'Nova Suíça / BH Shopping', sentido: 'Bairro', tempoMin: 7, distancia: '950m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '2151', destino: 'Vista Alegre / Serra', sentido: 'Centro', tempoMin: 10, distancia: '1.4 km', isRealtime: false, categoria: 'CIRCULAR' },
  { linha: '4102', destino: 'Aparecida / Serra', sentido: 'Centro', tempoMin: 5, distancia: '720m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '4103', destino: 'Novo Progresso / Mangabeiras', sentido: 'Centro', tempoMin: 8, distancia: '1.2 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '4107', destino: 'Alto Caiçara / Savassi', sentido: 'Centro', tempoMin: 6, distancia: '850m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '4108', destino: 'Pedro II / Mangabeiras', sentido: 'Centro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '4111', destino: 'Dom Cabral / Anchieta', sentido: 'Centro', tempoMin: 11, distancia: '1.6 km', isRealtime: false, categoria: 'DIAMETRAL' },
  { linha: '5102', destino: 'UFMG / Santo Antônio', sentido: 'Centro', tempoMin: 5, distancia: '750m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '5106', destino: 'Bandeirantes / BH Shopping via Savassi', sentido: 'Bairro', tempoMin: 6, distancia: '890m', isRealtime: true, categoria: 'DIAMETRAL' },
  { linha: '5107', destino: 'Estação Pampulha / Savassi', sentido: 'Centro', tempoMin: 4, distancia: '580m', isRealtime: true, categoria: 'TRONCAL' },

  // ── METROPOLITANAS INTEGRADAS ──
  { linha: '411C', destino: 'Terminal São Benedito / Centro - Direta', sentido: 'Centro', tempoMin: 8, distancia: '1.2 km', isRealtime: true, categoria: 'BRT MOVE' },
  { linha: '2580', destino: 'Eldorado / Centro via Amazonas', sentido: 'Centro', tempoMin: 9, distancia: '1.3 km', isRealtime: true, categoria: 'TRONCAL' },
  { linha: '2590', destino: 'Petrolândia / Centro', sentido: 'Centro', tempoMin: 12, distancia: '1.8 km', isRealtime: false, categoria: 'TRONCAL' },
  { linha: '4988', destino: 'Sabará / Centro via José Cândido', sentido: 'Centro', tempoMin: 15, distancia: '2.4 km', isRealtime: false, categoria: 'TRONCAL' },
];

export function buscarLinha(termo: string): LinhaBH[] {
  const q = termo.trim().toLowerCase();
  if (!q) return TODAS_LINHAS_BH;
  return TODAS_LINHAS_BH.filter(l => 
    l.linha.toLowerCase().includes(q) ||
    l.destino.toLowerCase().includes(q) ||
    (l.categoria && l.categoria.toLowerCase().includes(q))
  );
}
