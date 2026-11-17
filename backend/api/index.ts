import { fastify } from '../src/server';

export default async function handler(req, res) {
  // Ensure fastify is ready
  await fastify.ready();
  // Forward the incoming request to Fastify's request handler
  fastify.server.emit('request', req, res);
}
