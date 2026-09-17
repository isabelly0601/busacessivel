import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import { uploadFile, getPresignedUrl, deleteFile } from '../../services/storage.service';
import { pipeline } from 'stream/promises';

// ====================================================================
// 🛡️ Feature: Validação de Identidade PCD
// ====================================================================
// Fluxo Anti-Fraude:
// 1. Passageiro faz upload do laudo médico → MinIO
// 2. Admin revisa e aprova/rejeita
// 3. Apenas contas ATIVAS podem solicitar embarque
// ====================================================================

export async function validationRoutes(fastify: FastifyInstance) {

  // ================================================================
  // POST /api/validation/upload-laudo/:passageiroId
  // Upload de laudo médico para o MinIO
  // ================================================================
  fastify.post('/upload-laudo/:passageiroId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { passageiroId } = request.params as { passageiroId: string };

    const passageiro = await prisma.passageiro.findUnique({
      where: { id: passageiroId },
      include: { user: true }
    });

    if (!passageiro) {
      return reply.status(404).send({ error: 'Passageiro não encontrado' });
    }

    // Receber o arquivo via multipart
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Nenhum arquivo enviado' });
    }

    // Validar tipo de arquivo (apenas PDF e imagens)
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: 'Tipo de arquivo não permitido',
        message: 'Envie apenas PDF, PNG ou JPEG.',
        tiposPermitidos: allowedTypes
      });
    }

    // Montar o buffer do arquivo
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Nome seguro: passageiroId + timestamp + extensão
    const ext = data.filename.split('.').pop();
    const fileName = `laudos/${passageiroId}-${Date.now()}.${ext}`;

    // Upload para o MinIO
    const fileUrl = await uploadFile(fileName, fileBuffer, data.mimetype);

    // Salvar referência no banco (ValidacaoPCD)
    const validacao = await prisma.validacaoPCD.upsert({
      where: { passageiroId },
      update: {
        urlLaudoMedico: fileName, // Salva o path no MinIO, não a URL pública
      },
      create: {
        passageiroId,
        urlLaudoMedico: fileName,
      }
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: passageiro.user.id,
        acao: 'UPLOAD_LAUDO_PCD',
        detalhes: `Laudo enviado: ${fileName}`
      }
    });

    return reply.status(201).send({
      message: 'Laudo enviado com sucesso. Aguarde aprovação do administrador.',
      validacao,
      arquivo: fileName
    });
  });

  // ================================================================
  // GET /api/validation/laudo/:passageiroId
  // Visualizar laudo (gera URL temporária - LGPD)
  // ================================================================
  fastify.get('/laudo/:passageiroId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { passageiroId } = request.params as { passageiroId: string };

    const validacao = await prisma.validacaoPCD.findUnique({
      where: { passageiroId },
      include: { passageiro: { include: { user: true } } }
    });

    if (!validacao || !validacao.urlLaudoMedico) {
      return reply.status(404).send({ error: 'Laudo não encontrado' });
    }

    // Gera URL temporária (expira em 1 hora) - Conformidade LGPD
    const urlTemporaria = await getPresignedUrl(validacao.urlLaudoMedico, 3600);

    return {
      passageiro: validacao.passageiro.user.nome,
      statusConta: validacao.passageiro.user.statusConta,
      urlTemporaria, // Expira em 1h
      dataEnvio: validacao.criadoEm,
      validadoPor: validacao.validadoPorId || 'Pendente',
      motivoRejeicao: validacao.motivoRejeicao
    };
  });

  // ================================================================
  // PATCH /api/validation/aprovar/:passageiroId
  // Admin aprova o laudo e ativa a conta
  // ================================================================
  fastify.patch('/aprovar/:passageiroId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { passageiroId } = request.params as { passageiroId: string };
    const { adminId, numeroCartaoEspecial } = request.body as {
      adminId: string;
      numeroCartaoEspecial?: string;
    };

    const passageiro = await prisma.passageiro.findUnique({
      where: { id: passageiroId },
      include: { user: true }
    });

    if (!passageiro) {
      return reply.status(404).send({ error: 'Passageiro não encontrado' });
    }

    // Atualizar ValidacaoPCD
    await prisma.validacaoPCD.update({
      where: { passageiroId },
      data: {
        validadoPorId: adminId,
        dataValidacao: new Date(),
        numeroCartaoEspecial: numeroCartaoEspecial || null,
        motivoRejeicao: null // Limpar rejeição anterior se existir
      }
    });

    // Ativar a conta do usuário
    await prisma.user.update({
      where: { id: passageiro.userId },
      data: { statusConta: 'ATIVO' }
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        acao: 'APROVACAO_LAUDO_PCD',
        detalhes: `Laudo do passageiro ${passageiro.user.nome} (${passageiro.user.cpf}) aprovado.`
      }
    });

    return {
      message: 'Laudo aprovado e conta ativada com sucesso.',
      statusConta: 'ATIVO'
    };
  });

  // ================================================================
  // PATCH /api/validation/rejeitar/:passageiroId
  // Admin rejeita o laudo
  // ================================================================
  fastify.patch('/rejeitar/:passageiroId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { passageiroId } = request.params as { passageiroId: string };
    const { adminId, motivoRejeicao } = request.body as {
      adminId: string;
      motivoRejeicao: string;
    };

    if (!motivoRejeicao) {
      return reply.status(400).send({ error: 'Motivo de rejeição é obrigatório' });
    }

    const passageiro = await prisma.passageiro.findUnique({
      where: { id: passageiroId },
      include: { user: true }
    });

    if (!passageiro) {
      return reply.status(404).send({ error: 'Passageiro não encontrado' });
    }

    // Atualizar ValidacaoPCD com motivo
    const validacao = await prisma.validacaoPCD.update({
      where: { passageiroId },
      data: {
        validadoPorId: adminId,
        dataValidacao: new Date(),
        motivoRejeicao
      }
    });

    // Marcar conta como rejeitada
    await prisma.user.update({
      where: { id: passageiro.userId },
      data: { statusConta: 'REJEITADO' }
    });

    // Deletar o arquivo do MinIO (dados sensíveis)
    if (validacao.urlLaudoMedico) {
      await deleteFile(validacao.urlLaudoMedico);
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        acao: 'REJEICAO_LAUDO_PCD',
        detalhes: `Laudo do passageiro ${passageiro.user.nome} rejeitado. Motivo: ${motivoRejeicao}`
      }
    });

    return {
      message: 'Laudo rejeitado.',
      motivoRejeicao,
      statusConta: 'REJEITADO'
    };
  });

  // ================================================================
  // GET /api/validation/pendentes
  // Lista todas as validações pendentes (para o painel Admin)
  // ================================================================
  fastify.get('/pendentes', async () => {
    const pendentes = await prisma.validacaoPCD.findMany({
      where: {
        validadoPorId: null // Ainda não foi revisado
      },
      include: {
        passageiro: {
          include: { user: true }
        }
      },
      orderBy: { criadoEm: 'asc' } // Mais antigos primeiro
    });

    return pendentes.map(v => ({
      passageiroId: v.passageiroId,
      nome: v.passageiro.user.nome,
      cpf: v.passageiro.user.cpf,
      cartaoEspecial: v.numeroCartaoEspecial,
      enviadoEm: v.criadoEm,
      temLaudo: !!v.urlLaudoMedico
    }));
  });
}
