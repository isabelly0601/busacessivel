import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';

// ====================================================================
// 🔐 Middleware de Autorização por Role (RBAC)
// ====================================================================
// Este middleware verifica se o usuário autenticado possui a role
// necessária para acessar determinada rota. Deve ser usado em
// conjunto com o middleware de autenticação JWT.
//
// Uso:
//   fastify.get('/admin/users', { preHandler: authorize('ADMIN') }, handler)
//   fastify.post('/boarding', { preHandler: authorize('PASSAGEIRO') }, handler)
//   fastify.get('/reports', { preHandler: authorize('FISCAL', 'ADMIN') }, handler)
// ====================================================================

export function authorize(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verifica se o token JWT foi decodificado
      const user = (request as any).user;

      if (!user) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token JWT ausente ou inválido.'
        });
      }

      // Verifica se a role do usuário está entre as permitidas
      if (!allowedRoles.includes(user.role)) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: `Esta rota requer uma das seguintes permissões: ${allowedRoles.join(', ')}. Sua role atual: ${user.role}.`
        });
      }

      // Verifica se a conta está ativa (Trava de Segurança)
      if (user.statusConta && user.statusConta !== 'ATIVO') {
        return reply.status(403).send({
          error: 'Conta não ativa',
          message: `Sua conta está com status "${user.statusConta}". Aguarde a validação do administrador.`
        });
      }

    } catch (error) {
      return reply.status(500).send({
        error: 'Erro interno de autorização'
      });
    }
  };
}

// ====================================================================
// 🗺️ Mapa de Permissões por Funcionalidade
// ====================================================================
// Referência rápida de quais roles acessam quais funcionalidades:
//
// | Funcionalidade             | PASSAGEIRO | MOTORISTA | FISCAL | EMPRESA | ADMIN |
// |----------------------------|:----------:|:---------:|:------:|:-------:|:-----:|
// | Solicitar Embarque         |     ✅     |    ❌     |   ❌   |   ❌    |  ✅   |
// | Validar QR Code            |     ❌     |    ✅     |   ❌   |   ❌    |  ✅   |
// | Enviar Laudo PCD           |     ✅     |    ❌     |   ❌   |   ❌    |  ❌   |
// | Aprovar/Rejeitar Laudo     |     ❌     |    ❌     |   ❌   |   ❌    |  ✅   |
// | Registrar Alerta Ignorado  |     ❌     |    ❌     |   ✅   |   ❌    |  ✅   |
// | Relatório de Alertas       |     ❌     |    ❌     |   ✅   |   ✅    |  ✅   |
// | Gerenciar Frota/Linhas     |     ❌     |    ❌     |   ❌   |   ✅    |  ✅   |
// | Gerenciar Usuários         |     ❌     |    ❌     |   ❌   |   ❌    |  ✅   |
// ====================================================================
