// modulos/embarque/publico.ts
// Contrato público do módulo embarque

export type { SolicitacaoEmbarque, PayloadSolicitacao, StatusEmbarque } from './modelo';
export { solicitacaoEstaAtiva, montarDescricaoPonto } from './modelo';
export { useSolicitarEmbarque, useStatusEmbarque } from './cliente';
