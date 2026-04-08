import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function transitRoutes(fastify: FastifyInstance) {
  
  // POST /api/transit/sync (Atualizar dados de BHTrans/PBH)
  fastify.post('/sync', async () => {
    console.log('[TransitFeature] Starting BH Transit Sync...');
    
    // Seed com pontos chave de BH
    const keyPoints = [
      { nome: 'ESTAÇÃO PAMPULHA - MOVE', lat: -19.8519, lng: -43.9514, ext: 'BH-EST-PAM' },
      { nome: 'ESTAÇÃO VILARINHO - METRÔ/MOVE', lat: -19.8211, lng: -43.9452, ext: 'BH-EST-VIL' },
      { nome: 'PONTO PRAÇA DA LIBERDADE', lat: -19.9322, lng: -43.9381, ext: 'BH-LIB-01' },
      { nome: 'ESTAÇÃO ESPÍRITO SANTO - MOVE', lat: -19.9191, lng: -43.9386, ext: 'BH-ESP-SAN' }
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

  // GET /api/transit/pontos/proximos?lat=&lng=
  fastify.get('/pontos/proximos', async (request: FastifyRequest) => {
    const { lat, lng } = request.query as { lat: string, lng: string };
    
    if (!lat || !lng) return { error: 'Latitude e Longitude são obrigatórios' };

    // Simulação de busca num raio de 500m
    const pontos = await prisma.pontoOnibus.findMany({
      take: 10
    });

    return { pontos };
  });

  // GET /api/transit/linhas/ponto/:pontoId
  fastify.get('/linhas/ponto/:pontoId', async (request: FastifyRequest) => {
    const { pontoId } = request.params as { pontoId: string };
    
    // No MVP, retornamos todas as linhas cadastradas
    const linhas = await prisma.linha.findMany();
    
    return { pontoId, linhas };
  });
}
