// modulos/motorista/modelo.ts
// Tipos puros do domínio Motorista — sem dependência de banco, rede ou UI

export interface Ponto {
  id: string;
  nomeDescricao: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Passageiro {
  user: { nome: string };
}

export interface Alerta {
  id: string;
  ponto: Ponto;
  passageiro: Passageiro;
  latitudePassageiro?: number | null;
  longitudePassageiro?: number | null;
  createdAt?: string;
}

export interface EstadoViagem {
  linhaCode: string;
  emViagem: boolean;
  localizacao: { lat: number; lng: number } | null;
  gpsAtivo: boolean;
}

export type SentidoViagem = 'Centro' | 'Bairro' | 'Circular';

// Regras de negócio puras
export function validarCodigoLinha(codigo: string): boolean {
  return codigo.trim().length >= 1 && codigo.trim().length <= 10;
}

export function ehNovoAlerta(qtdAnterior: number, qtdAtual: number): boolean {
  return qtdAtual > qtdAnterior;
}
