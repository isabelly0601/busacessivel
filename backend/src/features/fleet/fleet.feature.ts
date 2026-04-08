import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function fleetRoutes(fastify: FastifyInstance) {
  
  // POST /api/fleet/pontos
  fastify.post('/pontos', async (request: FastifyRequest, reply: FastifyReply) => {
    const { nomeDescricao, latitude, longitude, externalId } = request.body as any;

    const ponto = await prisma.pontoOnibus.create({
      data: { nomeDescricao, latitude, longitude, externalId }
    });

    return reply.status(201).send(ponto);
  });

  // POST /api/fleet/linhas
  fastify.post('/linhas', async (request: FastifyRequest, reply: FastifyReply) => {
    const { codigo, nome, metropolitana, empresaId } = request.body as any;

    const linha = await prisma.linha.create({
      data: { codigo, nome, metropolitana, empresaId }
    });

    return reply.status(201).send(linha);
  });

  // GET /api/fleet/linhas
  fastify.get('/linhas', async () => {
    return await prisma.linha.findMany({
      include: { empresa: true }
    });
  });
}
