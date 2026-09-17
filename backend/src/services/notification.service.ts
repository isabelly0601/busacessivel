import { FastifyInstance } from 'fastify';

/**
 * Interface para o Serviço de SMS/WhatsApp
 * Na vida real, integraríamos aqui com Twilio, Vonage, WPPConnect, etc.
 */
export class NotificationService {
  constructor(private fastify: FastifyInstance) {}

  async sendOTP(telefone: string, codigo: string): Promise<boolean> {
    this.fastify.log.info(`[SMS/WhatsApp] Enviando OTP ${codigo} para ${telefone}`);
    
    // Simulação de integração com API externa
    // Exemplo Twilio:
    // await client.messages.create({ body: `Seu código BusAcessível é: ${codigo}`, from: '+123456', to: telefone });

    return true;
  }

  async notifyDriver(motoristaTelefone: string, mensagem: string): Promise<boolean> {
    this.fastify.log.info(`[SMS/WhatsApp] Notificando Motorista ${motoristaTelefone}: ${mensagem}`);
    return true;
  }
}
