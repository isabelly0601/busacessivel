// Armazenamento em memória para sincronização instantânea em tempo real entre Passageiro e Motorista
// mesmo quando o container Fastify estiver offline ou em ambiente Serverless (Vercel)

export interface SolicitacaoRealtime {
  id: string;
  codigoLinhaDesejada: string;
  nomePassageiro: string;
  pontoDescricao: string;
  latitudePassageiro?: number | null;
  longitudePassageiro?: number | null;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO';
  timestamp: number;
}

// Global singleton para preservar entre requisições no Node.js / Next.js server
declare global {
  // eslint-disable-next-line no-var
  var __busAcessivelAlertas: SolicitacaoRealtime[] | undefined;
}

if (!global.__busAcessivelAlertas) {
  global.__busAcessivelAlertas = [];
}

export function adicionarSolicitacao(payload: {
  codigoLinhaDesejada: string;
  nomePassageiro: string;
  pontoDescricao: string;
  latitudePassageiro?: number | null;
  longitudePassageiro?: number | null;
}): SolicitacaoRealtime {
  const nova: SolicitacaoRealtime = {
    id: `sol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    codigoLinhaDesejada: payload.codigoLinhaDesejada.trim(),
    nomePassageiro: payload.nomePassageiro || 'Passageiro PCD',
    pontoDescricao: payload.pontoDescricao || 'Ponto de Ônibus',
    latitudePassageiro: payload.latitudePassageiro ?? -19.9167,
    longitudePassageiro: payload.longitudePassageiro ?? -43.9345,
    status: 'PENDENTE',
    timestamp: Date.now()
  };

  if (!global.__busAcessivelAlertas) {
    global.__busAcessivelAlertas = [];
  }

  // Manter no máximo os últimos 50 alertas
  global.__busAcessivelAlertas.unshift(nova);
  if (global.__busAcessivelAlertas.length > 50) {
    global.__busAcessivelAlertas.pop();
  }

  return nova;
}

export function listarSolicitacoesPorLinha(linha?: string): SolicitacaoRealtime[] {
  if (!global.__busAcessivelAlertas) return [];
  const linhaAlvo = (linha || '').trim().toLowerCase();
  
  // Limpar solicitações expiradas com mais de 30 minutos
  const limite = Date.now() - 30 * 60 * 1000;
  global.__busAcessivelAlertas = global.__busAcessivelAlertas.filter(a => a.timestamp > limite);

  if (!linhaAlvo) {
    return global.__busAcessivelAlertas.filter(a => a.status === 'PENDENTE');
  }

  return global.__busAcessivelAlertas.filter(a => 
    a.status === 'PENDENTE' &&
    (a.codigoLinhaDesejada.toLowerCase() === linhaAlvo ||
     a.codigoLinhaDesejada.toLowerCase().includes(linhaAlvo))
  );
}

export function confirmarSolicitacao(id: string): boolean {
  if (!global.__busAcessivelAlertas) return false;
  const item = global.__busAcessivelAlertas.find(a => a.id === id);
  if (item) {
    item.status = 'CONFIRMADO';
    return true;
  }
  return false;
}

export function buscarSolicitacao(id: string): SolicitacaoRealtime | undefined {
  if (!global.__busAcessivelAlertas) return undefined;
  return global.__busAcessivelAlertas.find(a => a.id === id);
}
