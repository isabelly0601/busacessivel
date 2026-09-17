/**
 * store.ts — Banco de dados em memória para simular o backend
 * 
 * Usando uma variável global para persistir entre chamadas de API Routes
 * no mesmo processo do servidor Next.js (dev mode).
 */

export interface Solicitacao {
  id: string;
  codigoLinhaDesejada: string;
  status: 'PENDENTE' | 'NOTIFICADO';
  criadoEm: string;
  passageiro: {
    user: {
      nome: string;
    };
  };
  ponto: {
    nomeDescricao: string;
  };
}

// Variável global para persistir entre hot-reloads no dev
declare global {
  // eslint-disable-next-line no-var
  var __solicitacoesStore: Solicitacao[] | undefined;
}

if (!global.__solicitacoesStore) {
  global.__solicitacoesStore = [];
}

export const solicitacoes = global.__solicitacoesStore;

export function criarSolicitacao({
  codigoLinhaDesejada,
  nomePassageiro,
  pontoDescricao,
}: {
  codigoLinhaDesejada: string;
  nomePassageiro: string;
  pontoDescricao: string;
}): Solicitacao {
  const nova: Solicitacao = {
    id: `sol-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    codigoLinhaDesejada,
    status: 'PENDENTE',
    criadoEm: new Date().toISOString(),
    passageiro: {
      user: {
        nome: nomePassageiro,
      },
    },
    ponto: {
      nomeDescricao: pontoDescricao,
    },
  };

  solicitacoes.push(nova);
  return nova;
}

export function solicitacoesPorLinha(linha: string): Solicitacao[] {
  if (!linha) return [];
  return solicitacoes.filter(
    (s) =>
      s.codigoLinhaDesejada.toLowerCase() === linha.toLowerCase() &&
      s.status === 'PENDENTE'
  );
}

export function removerSolicitacao(id: string): void {
  const idx = solicitacoes.findIndex((s) => s.id === id);
  if (idx !== -1) {
    solicitacoes.splice(idx, 1);
  }
}
