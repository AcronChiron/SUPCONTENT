import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { apiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_WEB_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Rate limiter skipped in test env (it interferes with rapid integration tests)
  if (env.NODE_ENV !== 'test') {
    app.use(globalLimiter);
  }

  app.use('/api/v1', apiRouter);

  // Swagger UI (dev only)
  if (env.NODE_ENV === 'development') {
    try {
      const specPath = path.resolve(__dirname, '../openapi.yaml');
      const spec = YAML.parse(fs.readFileSync(specPath, 'utf8'));
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
    } catch (err) {
      console.warn('⚠️  Could not load OpenAPI spec:', (err as Error).message);
    }
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  return app;
}
