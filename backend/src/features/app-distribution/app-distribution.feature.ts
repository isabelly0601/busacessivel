import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

/**
 * App Distribution Feature - Handles APK downloads and application updates
 */
export async function appDistributionRoutes(fastify: FastifyInstance) {
  
  // Endpoint to download the latest APK
  fastify.get('/download-apk', async (request, reply) => {
    // Current directory is likely project root/backend
    // APK usually lives in frontend/android/app/build/outputs/apk/debug/app-debug.apk
    const apkPath = path.resolve(__dirname, '../../../../frontend/android/app/build/outputs/apk/debug/app-debug.apk');
    
    if (fs.existsSync(apkPath)) {
      const stream = fs.createReadStream(apkPath);
      reply.header('Content-Type', 'application/vnd.android.package-archive');
      reply.header('Content-Disposition', 'attachment; filename="BusAcessivel.apk"');
      return reply.send(stream);
    } else {
      return reply.status(404).send({ 
        error: 'APK não encontrado', 
        message: 'O APK ainda não foi gerado pelo pipeline de build.' 
      });
    }
  });

  // Info about the latest version
  fastify.get('/version', async () => {
    return {
      version: '1.0.0',
      build: 42,
      releaseDate: new Date().toISOString(),
      notes: 'Lançamento oficial com suporte a acessibilidade por voz.'
    };
  });
}
