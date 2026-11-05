// modulos/index.ts
// Ponto de entrada central para todos os módulos de domínio
// Use sempre os contratos públicos (publico.ts) de cada módulo,
// nunca importe diretamente de modelo.ts, repo.ts ou cliente.ts de outro módulo.

export * as Passageiro from './passageiro/publico';
export * as Motorista from './motorista/publico';
export * as Embarque from './embarque/publico';
export * as Admin from './admin/publico';
