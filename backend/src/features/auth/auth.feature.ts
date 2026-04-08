import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const otps = new Map<string, string>();

export async function authRoutes(fastify: FastifyInstance) {
  
  // POST /api/auth/register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, telefone, password, nome, role, cnpj, razaoSocial } = request.body as any;

    try {
      // 1. Create User
      const user = await prisma.user.create({
        data: {
          email,
          telefone,
          passwordHash: password, // In production, hash this!
          nome,
          role: role as Role,
          status: 'ativo'
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
    const { telefone } = request.body as { telefone: string };
    if (!telefone) return reply.status(400).send({ error: 'Telefone é obrigatório' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(telefone, code);
    
    // Simulação de log
    console.log(`[OTP] Código para ${telefone}: ${code}`);
    
    return { message: 'Código enviado com sucesso (simulado)', code };
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
