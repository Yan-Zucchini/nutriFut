// src/routes/logRoutes.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';
import { z } from 'zod';
import { Prisma } from '@prisma/client'; // Para tratamento de erros

export async function logRoutes(app: FastifyInstance) {

  // --- Esquemas de Validação (Zod) ---

  // Esquema para o CORPO da requisição (usado no POST e PUT)
  const logEntryBodySchema = z.object({
    eatenAt: z.string().datetime(), // Espera string ISO
    mealType: z.string().min(3),
    foodName: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    kcal: z.number().min(0),
    protein: z.number().min(0),
    carbohydrates: z.number().min(0),
    lipids: z.number().min(0),
  });

  // Esquema para PARÂMETROS de ID do atleta (usado no GET e POST)
  const athleteParamsSchema = z.object({
    athleteId: z.coerce.number().int().positive(),
  });

  // Esquema para PARÂMETROS de ID do registo (usado no PUT e DELETE)
  const logEntryParamsSchema = z.object({
    entryId: z.coerce.number().int().positive(),
  });

  // --- Rota 1: CRIAR um novo registro no diário ---
  // (Esta rota já existia)
  app.post('/api/athletes/:athleteId/log', async (req, reply) => {
    try {
      const { athleteId } = athleteParamsSchema.parse(req.params);
      const body = logEntryBodySchema.parse(req.body);

      const logEntry = await prisma.dailyLogEntry.create({
        data: {
          athleteId: athleteId,
          ...body, // Adiciona todos os campos validados
          eatenAt: new Date(body.eatenAt), // Converte string para Date
        },
      });

      return reply.status(201).send(logEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Erro de validação.', issues: error.format() });
      }
      // P2003 = Chave estrangeira falhou (ex: athleteId não existe)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return reply.status(404).send({ message: 'Atleta não encontrado.' });
      }
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });


  // --- Rota 2: LER o diário de um dia específico ---
  // (Esta rota já existia)
  app.get('/api/athletes/:athleteId/log', async (req, reply) => {
    try {
      const { athleteId } = athleteParamsSchema.parse(req.params);
      const { date } = z.object({ date: z.string().date() }).parse(req.query);

      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); 

      const logEntries = await prisma.dailyLogEntry.findMany({
        where: {
          athleteId: athleteId,
          eatenAt: { gte: startDate, lt: endDate },
        },
        orderBy: { eatenAt: 'asc' },
      });

      return reply.send(logEntries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Erro de validação (ID ou data).', issues: error.format() });
      }
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });


  // --- [NOVA] Rota 3: ATUALIZAR um registro do diário ---
  app.put('/api/log/:entryId', async (req, reply) => {
    try {
      // 1. Validar o ID do registo na URL
      const { entryId } = logEntryParamsSchema.parse(req.params);
      
      // 2. Validar o corpo (body), mas permitir atualizações parciais
      const body = logEntryBodySchema.partial().parse(req.body);

      // 3. Atualizar o registo no banco
      const updatedLogEntry = await prisma.dailyLogEntry.update({
        where: { id: entryId },
        data: {
          ...body,
          // Se uma nova data for enviada, converte-a
          eatenAt: body.eatenAt ? new Date(body.eatenAt) : undefined,
        },
      });

      return reply.send(updatedLogEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Erro de validação.', issues: error.format() });
      }
      // P2025 = Registo não encontrado para atualizar
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ message: 'Registo do diário não encontrado.' });
      }
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });


  // --- [NOVA] Rota 4: DELETAR um registro do diário ---
  app.delete('/api/log/:entryId', async (req, reply) => {
    try {
      // 1. Validar o ID do registo na URL
      const { entryId } = logEntryParamsSchema.parse(req.params);

      // 2. Deletar o registo
      await prisma.dailyLogEntry.delete({
        where: { id: entryId },
      });

      // 3. Retornar "Sem Conteúdo"
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'ID do registo inválido.', issues: error.format() });
      }
      // P2025 = Registo não encontrado para deletar
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ message: 'Registo do diário não encontrado.' });
      }
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });
}