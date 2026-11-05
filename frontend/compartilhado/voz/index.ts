// compartilhado/voz/index.ts
// Helper de síntese de voz reutilizável em todos os módulos

export function falar(texto: string, ativo = true): void {
  if (!ativo) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR';
  u.rate = 1.0;
  window.speechSynthesis.speak(u);
}

export function pararVoz(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
