import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function telemetryRoutes(fastify: FastifyInstance) {
  
  // GET /api/telemetry/alertas?linha=&lat=&lng=
  fastify.get('/alertas', async (request: FastifyRequest) => {
    const { linha, lat, lng } = request.query as any;

    if (!linha) return { error: 'Linha é obrigatória' };

    // Busca solicitações ativas para esta linha
    const solicitacoes = await prisma.solicitacaoEmbarque.findMany({
      where: {
        codigoLinhaDesejada: linha,
        status: 'aguardando'
      },
      include: {
        ponto: true,
        passageiro: { include: { user: true } }
      }
    });

    return { 
      message: solicitacoes.length > 0 ? 'Passageiros aguardando!' : 'Sem solicitações para esta linha no momento',
      solicitacoes 
    };
  });

  // PATCH /api/telemetry/notificar/:id
  fastify.patch('/notificar/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    
    const solicitacao = await prisma.solicitacaoEmbarque.update({
      where: { id },
      data: { status: 'onibus_notificado' }
    });

    return { message: 'Passageiro notificado da aproximação do ônibus', solicitacao };
  });
}
