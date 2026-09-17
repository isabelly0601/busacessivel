// ====================================================================
// 📍 Serviço de Geofencing — Cálculo de Distância Haversine
// ====================================================================
// Calcula a distância em metros entre duas coordenadas geográficas
// usando a fórmula de Haversine (precisão para distâncias curtas).
// Utilizado para validar o raio de 50 metros do ponto de ônibus.
// ====================================================================

const RAIO_TERRA_METROS = 6_371_000; // Raio médio da Terra em metros
const RAIO_MAXIMO_METROS = 50;       // Raio máximo permitido (regra de negócio)

interface Coordenada {
  latitude: number;
  longitude: number;
}

/**
 * Calcula a distância em metros entre dois pontos geográficos.
 * @param ponto1 - Coordenada do passageiro (GPS do dispositivo)
 * @param ponto2 - Coordenada do ponto de ônibus (cadastrado no banco)
 * @returns Distância em metros
 */
export function calcularDistanciaMetros(ponto1: Coordenada, ponto2: Coordenada): number {
  const toRad = (graus: number) => (graus * Math.PI) / 180;

  const dLat = toRad(ponto2.latitude - ponto1.latitude);
  const dLng = toRad(ponto2.longitude - ponto1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(ponto1.latitude)) *
      Math.cos(toRad(ponto2.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RAIO_TERRA_METROS * c;
}

/**
 * Verifica se o passageiro está dentro do raio permitido do ponto de ônibus.
 * @param passageiro - Coordenada GPS do passageiro
 * @param ponto - Coordenada do ponto de ônibus
 * @param raioMaximo - Raio máximo em metros (padrão: 50m)
 * @returns { dentro: boolean, distancia: number }
 */
export function verificarProximidade(
  passageiro: Coordenada,
  ponto: Coordenada,
  raioMaximo: number = RAIO_MAXIMO_METROS
): { dentro: boolean; distancia: number } {
  const distancia = calcularDistanciaMetros(passageiro, ponto);
  return {
    dentro: distancia <= raioMaximo,
    distancia: Math.round(distancia * 100) / 100, // Arredonda para 2 casas
  };
}

export { RAIO_MAXIMO_METROS };
