import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Setup CORS para permitir request do front
fastify.register(cors, {
  origin: '*',
});

fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: 'BusAcessível API is running!' };
});

// Criar Chamado (Passageiro logado em um ponto)
fastify.post('/chamados', async (request, reply) => {
  try {
    const { ponto, linha } = request.body as { ponto: string; linha: string };
    const chamado = await prisma.chamado.create({
      data: { ponto, linha, status: 'pendente' }
    });
    return reply.status(201).send(chamado);
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Erro ao criar chamado.' });
  }
});

// Listar Chamados Pendentes (Para o App do Motorista)
fastify.get('/chamados/pendentes', async (request, reply) => {
  try {
    const chamados = await prisma.chamado.findMany({
      where: { status: 'pendente' },
      orderBy: { createdAt: 'desc' }
    });
    return chamados;
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Erro ao buscar chamados.' });
  }
});

// Aceitar um chamado (Motorista acusa recebimento)
fastify.put('/chamados/:id/aceitar', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const chamado = await prisma.chamado.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'aceito' }
    });
    return chamado;
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Erro ao aceitar chamado.' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    fastify.log.info(`Server running on port 3001`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
