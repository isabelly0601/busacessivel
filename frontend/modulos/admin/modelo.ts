// modulos/admin/modelo.ts
// Tipos puros do domínio Admin

export interface EstatisticasDashboard {
  passageirosAtivos: number;
  onibusEmRota: number;
  alertasHoje: number;
}

export interface Veiculo {
  id: string;
  placa: string;
  linha: string;
  status: 'ATIVO' | 'INATIVO' | 'MANUTENCAO';
}

export interface PontoParada {
  id: string;
  descricao: string;
  latitude: number;
  longitude: number;
  acessivel: boolean;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
}

// Regras puras
export function veiculoEstaAtivo(v: Veiculo): boolean {
  return v.status === 'ATIVO';
}

export function pontoEhAcessivel(p: PontoParada): boolean {
  return p.acessivel;
}
