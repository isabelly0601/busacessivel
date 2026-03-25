import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Registrar Plugins
fastify.register(cors, { origin: '*' });
fastify.register(jwt, { secret: 'supersecret-busacessivel-key' });

// Mock de OTP em memória (Telefone -> Código)
const otps = new Map<string, string>();

fastify.get('/', async () => {
  return { status: 'ok', message: 'BusAcessível API Phase 1 is running!' };
});

/**
 * AUTHENTICATION
 */

// Solicitar código OTP (Simulado)
fastify.post('/api/auth/solicitar-codigo', async (request: FastifyRequest, reply: FastifyReply) => {
  const { telefone } = request.body as { telefone: string };
  
  if (!telefone) return reply.status(400).send({ error: 'Telefone é obrigatório' });

  // Gera um código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otps.set(telefone, code);

  fastify.log.info(`OTP para ${telefone}: ${code}`);
  
  return { message: 'Código enviado com sucesso (simulado)', code };
});

// Validar código OTP e fazer Device Binding
fastify.post('/api/auth/validar-codigo', async (request: FastifyRequest, reply: FastifyReply) => {
  const { telefone, codigoOtp, deviceId, nomePreferencial } = request.body as { 
    telefone: string; 
    codigoOtp: string; 
    deviceId: string;
    nomePreferencial?: string;
  };

  const storedOtp = otps.get(telefone);

  if (!storedOtp || storedOtp !== codigoOtp) {
    return reply.status(401).send({ error: 'Código inválido ou expirado' });
  }

  // Tenta encontrar o passageiro ou cria um novo
  let passageiro = await prisma.passageiro.findUnique({ where: { telefone } });

  if (!passageiro) {
    passageiro = await prisma.passageiro.create({
      data: {
        telefone,
        deviceId,
        nomePreferencial,
        statusConta: 'ativo'
      }
    });
  } else if (passageiro.deviceId !== deviceId) {
    passageiro = await prisma.passageiro.update({
      where: { id: passageiro.id },
      data: { deviceId }
    });
  }

  // Gera o Token JWT
  const token = fastify.jwt.sign({ id: passageiro.id, deviceId: passageiro.deviceId });

  otps.delete(telefone);

  return { token, passageiro };
});

/**
 * GEOGRAPHIC HELPERS
 */

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * PONTOS DE ÔNIBUS (Phase 2)
 */

fastify.get('/api/pontos/proximos', async (request: FastifyRequest) => {
  const { lat, lng, raio = '0.5' } = request.query as { lat: string; lng: string; raio?: string };
  
  if (!lat || !lng) return { error: 'Latitude e Longitude são obrigatórias' };

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = parseFloat(raio);

  const todosPontos = await prisma.pontoOnibus.findMany();
  
  return todosPontos.filter((ponto: any) => {
    const dist = calculateDistance(userLat, userLng, Number(ponto.latitude), Number(ponto.longitude));
    return dist <= radiusKm;
  });
});

/**
 * EMBARQUE (Phase 2)
 */

// Solicitar Embarque (Autenticado)
fastify.post('/api/embarque/solicitar', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify(); // Middleware manual no MVP
    const { id: passageiroId } = request.user as { id: string };
    
    const { pontoId, codigoLinhaDesejada, lat, lng } = request.body as { 
      pontoId: string; 
      codigoLinhaDesejada: string; 
      lat: number; 
      lng: number; 
    };

    const solicitacao = await prisma.solicitacaoEmbarque.create({
      data: {
        passageiroId,
        pontoId,
        codigoLinhaDesejada,
        latitudePassageiro: lat,
        longitudePassageiro: lng,
        status: 'aguardando'
      }
    });

    return reply.status(201).send(solicitacao);
  } catch (err) {
    return reply.status(401).send({ error: 'Não autorizado ou dados inválidos' });
  }
});

// Status da Solicitação (Polling)
fastify.get('/api/embarque/:id/status', async (request: FastifyRequest) => {
  const { id } = request.params as { id: string };
  return await prisma.solicitacaoEmbarque.findUnique({
    where: { id },
    select: { status: true, atualizadoEm: true }
  });
});

/**
 * MOTORISTA (Phase 2)
 */

fastify.get('/api/motorista/alertas', async (request: FastifyRequest) => {
  const { codigoLinha, lat, lng } = request.query as { codigoLinha: string; lat: string; lng: string };
  
  if (!codigoLinha || !lat || !lng) return { error: 'Dados incompletos' };

  const driverLat = parseFloat(lat);
  const driverLng = parseFloat(lng);

  // Busca solicitações ativas para esta linha
  const solicitacoesAtivas = await prisma.solicitacaoEmbarque.findMany({
    where: { 
      codigoLinhaDesejada: codigoLinha,
      status: { in: ['aguardando', 'onibus_notificado'] }
    },
    include: { ponto: true }
  });

  // Filtra por pedidos em pontos num raio de 1.5km (aproximação)
  return solicitacoesAtivas.filter((s: any) => {
    const dist = calculateDistance(driverLat, driverLng, Number(s.ponto.latitude), Number(s.ponto.longitude));
    return dist <= 1.5; // Alerta motorista num raio de 1.5km
  });
});

// Notificar que o ônibus está chegando
fastify.patch('/api/embarque/:id/notificar-onibus', async (request: FastifyRequest) => {
  const { id } = request.params as { id: string };
  return await prisma.solicitacaoEmbarque.update({
    where: { id },
    data: { status: 'onibus_notificado' }
  });
});

/**
 * LINHAS / VEÍCULOS (Phase 1 legacy)
 */

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
