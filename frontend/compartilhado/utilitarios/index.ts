// compartilhado/utilitarios/index.ts
// Funções puras reutilizáveis

export function vibrar(padrao: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(padrao);
  }
}

export function formatarTempo(minutos: number): string {
  if (minutos < 1) return 'Chegando';
  if (minutos === 1) return '1 min';
  return `${minutos} min`;
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${metros}m`;
  return `${(metros / 1000).toFixed(1)} km`;
}
