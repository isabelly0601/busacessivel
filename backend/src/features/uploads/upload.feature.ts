import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export async function uploadRoutes(fastify: FastifyInstance) {
  
  // POST /api/uploads/perfil/:userId
  fastify.post('/perfil/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'Nenhum arquivo enviado' });
    }

    const uploadDir = path.join(__dirname, '../../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${userId}-${Date.now()}${path.extname(data.filename)}`;
    const savePath = path.join(uploadDir, filename);

    await pipeline(data.file, fs.createWriteStream(savePath));

    // Simulação: Apenas logamos que o arquivo foi salvo. 
    // Em produção, salvaríamos a URL no banco de dados.
    fastify.log.info(`Arquivo salvo em: ${savePath}`);

    return { 
      message: 'Upload realizado com sucesso', 
      filename,
      url: `/uploads/${filename}` 
    };
  });
}
