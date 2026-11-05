// modulos/embarque/modelo.ts
// Tipos puros do domínio Embarque — sem dependência de banco, rede ou UI

export type StatusEmbarque = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'EXPIRADO';

export interface SolicitacaoEmbarque {
  id: string;
  codigoLinhaDesejada: string;
  nomePassageiro: string;
  pontoDescricao: string;
  status: StatusEmbarque;
  createdAt?: string;
}

export interface PayloadSolicitacao {
  codigoLinhaDesejada: string;
  nomePassageiro: string;
  pontoDescricao: string;
}

// Regras puras
export function solicitacaoEstaAtiva(sol: SolicitacaoEmbarque): boolean {
  return sol.status === 'PENDENTE' || sol.status === 'CONFIRMADO';
}

export function montarDescricaoPonto(
  localizacao: { lat: number; lng: number } | null
): string {
  if (!localizacao) return 'Ponto central de embarque';
  return `Ponto próximo ao GPS (${localizacao.lat.toFixed(4)}, ${localizacao.lng.toFixed(4)})`;
}
