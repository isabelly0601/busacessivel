import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotificationService } from '../../services/notification.service';

const otps = new Map<string, string>();

export async function authRoutes(fastify: FastifyInstance) {
  const notificationService = new NotificationService(fastify);
  
  // POST /api/auth/register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    let { email, telefone, password, nome, role, cnpj, razaoSocial, cpf } = request.body as any;

    // Se for registro rápido de PCD (FaceID somente)
    if (role === 'PASSAGEIRO' && !cpf) {
      const uniqueId = Math.random().toString(36).substring(2, 11);
      cpf = `PCD-${uniqueId}`; // CPF fictício interno
      email = `pcd_${uniqueId}@busacessivel.com`;
      nome = nome || `Passageiro PCD ${uniqueId}`;
    }

    try {
      // 1. Create User
      const user = await prisma.user.create({
        data: {
          email,
          telefone: telefone || null,
          cpf: cpf,
          passwordHash: password || 'face-id-pcd', // In production, hash this!
          nome,
          role: role as Role,
          statusConta: 'ATIVO'
        }
      });

      // 2. Create specific profile
      if (role === 'PASSAGEIRO') {
        await prisma.passageiro.create({
          data: { userId: user.id }
        });
      } else if (role === 'EMPRESA') {
        if (!cnpj || !razaoSocial) {
          return reply.status(400).send({ error: 'CNPJ e Razão Social são obrigatórios para empresas' });
        }
        await prisma.empresa.create({
          data: { userId: user.id, cnpj, razaoSocial }
        });
      } else if (role === 'MOTORISTA') {
        await prisma.motorista.create({
          data: { userId: user.id }
        });
      }

      return reply.status(201).send({ message: 'Usuário registrado com sucesso', userId: user.id });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Erro ao registrar usuário', detail: error.message });
    }
  });

  // POST /api/auth/solicitar-codigo
  fastify.post('/solicitar-codigo', async (request: FastifyRequest, reply: FastifyReply) => {
    const { identifier } = request.body as { identifier: string };
    if (!identifier) return reply.status(400).send({ error: 'Identificador é obrigatório' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(identifier, code);
    
    // Enviar código (Simulação para outros canais)
    fastify.log.info(`Código OTP para ${identifier}: ${code}`);
    
    return { message: 'Código enviado com sucesso via SMS/WhatsApp', code };
  });

  // POST /api/auth/validar-codigo
  fastify.post('/validar-codigo', async (request: FastifyRequest, reply: FastifyReply) => {
    const { telefone, codigoOtp, deviceId, nomePreferencial } = request.body as any;
    const storedOtp = otps.get(telefone);

    if (!storedOtp || storedOtp !== codigoOtp) {
      return reply.status(401).send({ error: 'Código inválido ou expirado' });
    }

    // Procura User pelo telefone
    let user = await prisma.user.findUnique({ 
      where: { telefone }, 
      include: { passageiro: true } 
    });

    if (!user) {
      // Cria User e Passageiro se não existir
      user = await prisma.user.create({
        data: {
          telefone,
          nome: nomePreferencial || 'Passageiro',
          role: 'PASSAGEIRO',
          passageiro: {
            create: { deviceId }
          }
        },
        include: { passageiro: true }
      });
    } else if (user.passageiro && user.passageiro.deviceId !== deviceId) {
      await prisma.passageiro.update({
        where: { id: user.passageiro.id },
        data: { deviceId }
      });
    }

    // Token JWT (usando o plugin fastify-jwt registrado no server.ts)
    const token = fastify.jwt.sign({ id: user.id, role: user.role });
    otps.delete(telefone);

    return { token, user };
  });
}
