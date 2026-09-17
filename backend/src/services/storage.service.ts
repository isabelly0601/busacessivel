import { Client } from 'minio';

// ====================================================================
// 📦 Storage Service — Integração com MinIO (Object Storage S3)
// ====================================================================
// Este serviço centraliza todas as operações de upload e download
// de arquivos (laudos médicos, imagens de perfil, comprovantes)
// com o contêiner MinIO, seguindo o padrão da API Amazon S3.
// ====================================================================

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'laudos-pcd';

/**
 * Faz o upload de um arquivo para o MinIO.
 * @param fileName - Nome do arquivo no storage (ex: "user-uuid-1234.pdf")
 * @param fileBuffer - Buffer do arquivo recebido via multipart
 * @param mimeType - Tipo MIME do arquivo (ex: "application/pdf", "image/png")
 * @returns URL pública do arquivo salvo
 */
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  // Garante que o bucket existe
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME);
  }

  // Faz o upload do arquivo
  await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, {
    'Content-Type': mimeType,
  });

  // Retorna a URL interna do arquivo
  return `http://${process.env.MINIO_ENDPOINT || 'minio'}:${process.env.MINIO_PORT || 9000}/${BUCKET_NAME}/${fileName}`;
}

/**
 * Gera uma URL temporária (Presigned URL) para download seguro.
 * A URL expira após o tempo especificado (padrão: 1 hora).
 * Garante conformidade com a LGPD ao não expor dados permanentemente.
 * @param fileName - Nome do arquivo no storage
 * @param expirySeconds - Tempo de expiração em segundos (padrão: 3600 = 1 hora)
 * @returns URL temporária para acesso ao arquivo
 */
export async function getPresignedUrl(
  fileName: string,
  expirySeconds: number = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, fileName, expirySeconds);
}

/**
 * Remove um arquivo do MinIO.
 * Útil quando um administrador rejeita um laudo e o documento precisa ser excluído.
 * @param fileName - Nome do arquivo a ser removido
 */
export async function deleteFile(fileName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, fileName);
}

export { minioClient, BUCKET_NAME };
