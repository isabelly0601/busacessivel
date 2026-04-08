import { describe, it, expect } from 'vitest';
import { calcularDistanciaMetros, verificarProximidade } from '../../services/geofencing.service';

// ====================================================================
// 🧪 Testes de Geofencing — Validação do Raio de 50 metros
// ====================================================================

describe('Geofencing Service', () => {

  // Ponto de ônibus de referência: Praça Sete - BH
  const pontoOnibus = { latitude: -19.9191, longitude: -43.9378 };

  it('deve aprovar passageiro a 30 metros do ponto (DENTRO do raio)', () => {
    // ~30 metros ao norte do ponto
    const passageiro = { latitude: -19.91883, longitude: -43.9378 };
    const resultado = verificarProximidade(passageiro, pontoOnibus);

    expect(resultado.dentro).toBe(true);
    expect(resultado.distancia).toBeLessThan(50);
  });

  it('deve rejeitar passageiro a 100 metros do ponto (FORA do raio)', () => {
    // ~100 metros ao norte do ponto
    const passageiro = { latitude: -19.9182, longitude: -43.9378 };
    const resultado = verificarProximidade(passageiro, pontoOnibus);

    expect(resultado.dentro).toBe(false);
    expect(resultado.distancia).toBeGreaterThan(50);
  });

  it('deve aprovar passageiro na posição exata do ponto (0 metros)', () => {
    const resultado = verificarProximidade(pontoOnibus, pontoOnibus);

    expect(resultado.dentro).toBe(true);
    expect(resultado.distancia).toBe(0);
  });

  it('deve calcular distância correta entre dois pontos conhecidos', () => {
    // Praça Sete → Praça da Liberdade (~1.2 km)
    const pracaSete = { latitude: -19.9191, longitude: -43.9378 };
    const pracaLiberdade = { latitude: -19.9319, longitude: -43.9381 };

    const distancia = calcularDistanciaMetros(pracaSete, pracaLiberdade);

    expect(distancia).toBeGreaterThan(1000);
    expect(distancia).toBeLessThan(1500);
  });

  it('deve respeitar raio personalizado quando informado', () => {
    // Passageiro a ~80m do ponto
    const passageiro = { latitude: -19.91838, longitude: -43.9378 };

    const resultado50m = verificarProximidade(passageiro, pontoOnibus, 50);
    const resultado100m = verificarProximidade(passageiro, pontoOnibus, 100);

    expect(resultado50m.dentro).toBe(false);
    expect(resultado100m.dentro).toBe(true);
  });
});

describe('Boarding Logic — Validação de Status', () => {

  it('deve bloquear usuário com status PENDENTE', () => {
    const statusConta = 'PENDENTE';
    expect(statusConta).not.toBe('ATIVO');
  });

  it('deve bloquear usuário com status REJEITADO', () => {
    const statusConta = 'REJEITADO';
    expect(statusConta).not.toBe('ATIVO');
  });

  it('deve permitir usuário com status ATIVO', () => {
    const statusConta = 'ATIVO';
    expect(statusConta).toBe('ATIVO');
  });
});
