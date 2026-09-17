import { FastifyInstance } from 'fastify';

/**
 * SMS Feature - Handles SMS code verification and receiving
 */
export async function smsRoutes(fastify: FastifyInstance) {
  
  // Endpoint to send a simulation/real SMS code
  fastify.post('/send', async (request, reply) => {
    const { phoneNumber } = request.body as { phoneNumber: string };
    
    // In a real scenario, integrate with Twilio/Vonage
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    fastify.log.info(`Sending SMS code ${code} to ${phoneNumber}`);
    
    return { 
      success: true, 
      message: 'Código enviado com sucesso via SMS',
      // We return the code in dev mode for easy testing
      debugCode: code 
    };
  });

  // Endpoint to receive/verify a code
  fastify.post('/verify', async (request, reply) => {
    const { phoneNumber, code } = request.body as { phoneNumber: string, code: string };
    
    // Verification logic here (usually checking Redis/Database)
    if (code === '123456') { // Mock verification
      return { success: true, message: 'Código verificado!' };
    }
    
    return reply.status(400).send({ success: false, message: 'Código inválido' });
  });

  // New API requested: Receive code for SMS (webhook style)
  fastify.post('/receive-callback', async (request, reply) => {
    const data = request.body;
    fastify.log.info('Receiving SMS Callback:', data);
    
    return { status: 'acknowledged' };
  });
}
