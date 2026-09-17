import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function transitRoutes(fastify: FastifyInstance) {
  
  // POST /api/transit/sync (Atualizar dados de BHTrans/PBH)
  fastify.post('/sync', async () => {
    console.log('[TransitFeature] Starting BH Transit Sync...');
    
    // Seed com pontos chave de BH
    const keyPoints = [
      { nome: 'ESTACAO PAMPULHA - MOVE', lat: -19.8519, lng: -43.9514, ext: 'BH-EST-PAM' },
      { nome: 'ESTACAO VILARINHO - METRO/MOVE', lat: -19.8211, lng: -43.9452, ext: 'BH-EST-VIL' },
      { nome: 'PONTO PRACA DA LIBERDADE', lat: -19.9322, lng: -43.9381, ext: 'BH-LIB-01' },
      { nome: 'ESTACAO ESPIRITO SANTO - MOVE', lat: -19.9191, lng: -43.9386, ext: 'BH-ESP-SAN' }
    ];

    for (const point of keyPoints) {
      await prisma.pontoOnibus.upsert({
        where: { externalId: point.ext },
        update: {
          nomeDescricao: point.nome,
          latitude: point.lat,
          longitude: point.lng
        },
        create: {
          externalId: point.ext,
          nomeDescricao: point.nome,
          latitude: point.lat,
          longitude: point.lng
        }
      });
    }

    return { message: 'Dados de transporte sincronizados com sucesso', count: keyPoints.length };
  });

  // GET /api/transit/pontos/proximos?lat=&lng= (e alias /stops/nearby)
  const getNearbyStops = async (request: FastifyRequest) => {
    const { lat, lng } = request.query as { lat: string, lng: string };
    
    if (!lat || !lng) return { error: 'Latitude e Longitude sao obrigatorios' };

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Haversine formula directly in PostgreSQL
    const pontos: any[] = await prisma.$queryRaw`
      SELECT id, "externalId", "nomeDescricao", latitude, longitude,
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) AS distance
      FROM "PontoOnibus"
      ORDER BY distance ASC
      LIMIT 20
    `;

    return { 
      pontos: pontos.map(p => ({
        ...p,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        distance: Number(p.distance)
      })) 
    };
  };

  fastify.get('/pontos/proximos', getNearbyStops);
  fastify.get('/stops/nearby', getNearbyStops);

  // GET /api/transit/linhas/ponto/:pontoId
  fastify.get('/linhas/ponto/:pontoId', async (request: FastifyRequest) => {
    const { pontoId } = request.params as { pontoId: string };
    
    // Busca linhas que tem associacao com este ponto
    const linhasPontos = await prisma.linhaPonto.findMany({
      where: { pontoId },
      include: { linha: true }
    });

    const linhas = linhasPontos.map(lp => lp.linha);
    
    return { pontoId, linhas };
  });
}
