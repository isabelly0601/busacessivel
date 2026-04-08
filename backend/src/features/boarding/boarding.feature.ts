import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { verificarProximidade } from '../../services/geofencing.service';

// ====================================================================
// 🎫 Feature: Embarque de Passageiros
// ====================================================================
// Regras de negócio implementadas:
// 1. Trava de Conta: Usuário deve ter statusConta === ATIVO
// 2. Geofencing: Passageiro deve estar a no máximo 50m do ponto
// 3. PDF de comprovante com PDFKit
// ====================================================================

export async function boardingRoutes(fastify: FastifyInstance) {
  
  // POST /api/boarding/solicitar
  fastify.post('/solicitar', async (request: FastifyRequest, reply: FastifyReply) => {
    const { passageiroId, pontoId, linhaId, codigoLinhaDesejada, lat, lng } = request.body as any;

    if (!passageiroId || !pontoId || !codigoLinhaDesejada || !lat || !lng) {
      return reply.status(400).send({ error: 'Dados insuficientes para solicitação' });
    }

    try {
      // ================================================================
      // REGRA 1: Trava de Segurança — Verificar Status da Conta
      // ================================================================
      const passageiro = await prisma.passageiro.findUnique({
        where: { id: passageiroId },
        include: { user: true }
      });

      if (!passageiro) {
        return reply.status(404).send({ error: 'Passageiro não encontrado' });
      }

      if (passageiro.user.statusConta !== 'ATIVO') {
        return reply.status(403).send({
          error: 'Conta não ativa',
          message: `Sua conta está com status "${passageiro.user.statusConta}". Envie seu laudo PCD e aguarde aprovação do administrador.`,
          statusConta: passageiro.user.statusConta
        });
      }

      // ================================================================
      // REGRA 2: Geofencing — Verificar Proximidade do Ponto (50m)
      // ================================================================
      const ponto = await prisma.pontoOnibus.findUnique({
        where: { id: pontoId }
      });

      if (!ponto) {
        return reply.status(404).send({ error: 'Ponto de ônibus não encontrado' });
      }

      const resultado = verificarProximidade(
        { latitude: Number(lat), longitude: Number(lng) },
        { latitude: Number(ponto.latitude), longitude: Number(ponto.longitude) }
      );

      if (!resultado.dentro) {
        return reply.status(403).send({
          error: 'Fora do raio permitido',
          message: `Você está a ${resultado.distancia}m do ponto. O limite é de 50 metros. Aproxime-se do ponto de ônibus para solicitar embarque.`,
          distancia: resultado.distancia
        });
      }

      // ================================================================
      // Criar solicitação de embarque
      // ================================================================
      const solicitacao = await prisma.solicitacaoEmbarque.create({
        data: {
          passageiroId,
          pontoId,
          linhaId: linhaId || undefined,
          codigoLinhaDesejada,
          latitudePassageiro: lat,
          longitudePassageiro: lng,
          distanciaMotoristaNotif: resultado.distancia,
          status: 'AGUARDANDO'
        }
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: passageiro.user.id,
          acao: 'SOLICITACAO_EMBARQUE',
          detalhes: `Solicitação criada para linha ${codigoLinhaDesejada} no ponto ${ponto.nomeDescricao}. Distância: ${resultado.distancia}m.`
        }
      });

      return reply.status(201).send({
        ...solicitacao,
        distanciaAoPonto: resultado.distancia
      });

    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao criar solicitação', detail: error.message });
    }
  });

  // GET /api/boarding/:id/status
  fastify.get('/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    
    const solicitacao = await prisma.solicitacaoEmbarque.findUnique({
      where: { id },
      include: { ponto: true, linha: true }
    });

    return solicitacao || { error: 'Solicitação não encontrada' };
  });

  // PATCH /api/boarding/:id/cancelar
  fastify.patch('/:id/cancelar', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    
    const solicitacao = await prisma.solicitacaoEmbarque.update({
      where: { id },
      data: { status: 'CANCELADO' }
    });

    return { message: 'Solicitação cancelada', solicitacao };
  });

  // PATCH /api/boarding/:id/embarcar (Motorista valida embarque)
  fastify.patch('/:id/embarcar', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { motoristaId } = request.body as { motoristaId: string };

    const solicitacao = await prisma.solicitacaoEmbarque.update({
      where: { id },
      data: {
        status: 'EMBARCADO',
        motoristaId,
        validadoEm: new Date()
      }
    });

    return { message: 'Passageiro embarcado com sucesso', solicitacao };
  });

  // GET /api/boarding/:id/pdf
  fastify.get('/:id/pdf', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const PDFDocument = require('pdfkit');
    
    const solicitacao = await prisma.solicitacaoEmbarque.findUnique({
      where: { id },
      include: { ponto: true, passageiro: { include: { user: true } } }
    });

    if (!solicitacao) return reply.status(404).send({ error: 'Solicitação não encontrada' });

    const doc = new PDFDocument();
    let buffers: any[] = [];
    doc.on('data', (chunk: any) => buffers.push(chunk));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      reply
        .type('application/pdf')
        .header('Content-Disposition', `attachment; filename=comprovante_${id}.pdf`)
        .send(pdfData);
    });

    doc.fontSize(25).text('Comprovante de Embarque - BusAcessível', 100, 80);
    doc.fontSize(12).text(`ID: ${solicitacao.id}`, 100, 130);
    doc.text(`Passageiro: ${solicitacao.passageiro.user.nome}`, 100, 150);
    doc.text(`Linha: ${solicitacao.codigoLinhaDesejada}`, 100, 170);
    doc.text(`Ponto: ${solicitacao.ponto.nomeDescricao}`, 100, 190);
    doc.text(`Data: ${solicitacao.criadoEm.toLocaleString()}`, 100, 210);
    doc.text(`Status Final: ${solicitacao.status}`, 100, 230);
    doc.end();
  });
}
