// modulos/motorista/publico.ts
// Contrato público do módulo motorista — única porta de entrada para outros módulos

export type { Alerta, Ponto, Passageiro, EstadoViagem } from './modelo';
export { validarCodigoLinha, ehNovoAlerta } from './modelo';
export { useGpsMotorista, useAlertas } from './cliente';
