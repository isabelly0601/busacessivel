// modulos/passageiro/componentes/index.ts
// Re-exporta os componentes do domínio Passageiro
// Os componentes originais permanecem em app/passageiro/components/ (Strangler Pattern)

export { default as AssistenteVoz } from '../../../app/passageiro/components/VoiceAssistantModal';
export { default as ModalAjuda } from '../../../app/passageiro/components/HelpModal';
export { default as DetectorObstaculos } from '../../../app/passageiro/components/ObstacleDetector';
// MapaAcessivel usa 'leaflet' — importar com dynamic() no consumer
// export { default as MapaAcessivel } from '../../../app/passageiro/components/AccessibilityMap';
