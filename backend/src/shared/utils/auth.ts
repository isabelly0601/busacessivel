import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';

export function checkRole(allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const { role } = request.user as { role: Role };

      if (!allowedRoles.includes(role)) {
        return reply.status(403).send({ error: 'Acesso negado: permissão insuficiente' });
      }
    } catch (err) {
      return reply.status(401).send({ error: 'Token inválido ou ausente' });
    }
  };
}
