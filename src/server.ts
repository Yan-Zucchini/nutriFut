// src/server.ts

import Fastify from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import { loadTacoData } from './services/tacoService.js';
import { foodRoutes } from './routes/foodRoutes.js';
import { athleteRoutes } from './routes/athleteRoutes.js';
import { planRoutes } from './routes/planRoutes.js'; // <-- 1. IMPORTAR

const app = Fastify({ logger: true });

// --- Servir arquivos estáticos (Frontend) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

// --- Registrar as rotas da API ---
app.register(foodRoutes);
app.register(athleteRoutes);
app.register(planRoutes); // <-- 2. REGISTRAR

// --- Função de inicialização ---
const start = async () => {
  try {
    await loadTacoData();
    await app.listen({ port: 3333 });
    app.log.info('Servidor HTTP rodando e pronto para buscas em http://localhost:3333');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();