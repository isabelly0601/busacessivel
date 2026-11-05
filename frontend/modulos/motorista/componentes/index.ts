// modulos/motorista/componentes/index.ts
// Re-exporta todos os componentes do domínio Motorista

export { default as PainelMotorista } from '../../../app/motorista/components/MotoristaDashboard';
export { default as CardAlerta } from '../../../app/motorista/components/AlertCard';
export { default as ConfiguracaoRota } from '../../../app/motorista/components/RouteSetup';
// MapaMotorista usa 'leaflet' e precisa de dynamic import no consumer
