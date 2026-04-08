import { describe, it, expect } from 'vitest';

describe('Auth Feature', () => {
  it('deve validar um número de telefone no formato correto', () => {
    const telefone = '+5531988887777';
    const regex = /^\+[1-9]\d{1,14}$/; // E.164 format
    expect(regex.test(telefone)).toBe(true);
  });

  it('deve falhar para números de telefone inválidos', () => {
    const telefone = '12345';
    const regex = /^\+[1-9]\d{1,14}$/;
    expect(regex.test(telefone)).toBe(false);
  });
});
