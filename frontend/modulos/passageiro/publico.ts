// modulos/passageiro/publico.ts
// Contrato público do módulo passageiro

export type { OnibusItem, FiltroSentido, SentidoOnibus } from './modelo';
export { LINHAS_DISPONIVEIS, filtrarLinhas } from './modelo';
export { useLinhas, useLinhasSolicitadas } from './cliente';
