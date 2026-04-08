import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';

// Registrar Feature Slices (Vertical Slice Architecture)
import { authRoutes } from './features/auth/auth.feature';
import { transitRoutes } from './features/transit/transit.feature';
import { boardingRoutes } from './features/boarding/boarding.feature';
import { telemetryRoutes } from './features/telemetry/telemetry.feature';
import { fleetRoutes } from './features/fleet/fleet.feature';
import { uploadRoutes } from './features/uploads/upload.feature';
import { validationRoutes } from './features/validation/validation.feature';

const fastify = Fastify({ logger: true });

// Registrar Plugins
fastify.register(cors, { origin: '*' });
fastify.register(jwt, { secret: 'supersecret-busacessivel-key' });
fastify.register(multipart, {
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 100,     // Max field value size in bytes
    fields: 10,         // Max number of non-file fields
    fileSize: 10_000_000,  // 10MB para laudos médicos PCD
    files: 1,           // Max number of file fields
    headerPairs: 2000   // Max number of header key=>value pairs
  }
});

// Health Check
fastify.get('/', async () => {
  return { 
    status: 'ok', 
    version: '2.0-vsa',
    message: 'BusAcessível API Refactored to Vertical Slice Architecture!' 
  };
});

// Registrar Features diretamente
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(transitRoutes, { prefix: '/api/transit' });
fastify.register(boardingRoutes, { prefix: '/api/boarding' });
fastify.register(telemetryRoutes, { prefix: '/api/telemetry' });
fastify.register(fleetRoutes, { prefix: '/api/fleet' });
fastify.register(uploadRoutes, { prefix: '/api/uploads' });
fastify.register(validationRoutes, { prefix: '/api/validation' });

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
