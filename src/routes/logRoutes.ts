// src/routes/logRoutes.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';
import { z } from 'zod';

export async function logRoutes(app: FastifyInstance) {

  // --- Esquema de Validação (Zod) ---
  // Define a "forma" que o frontend deve enviar os dados
  const logEntryBodySchema = z.object({
    eatenAt: z.string().datetime(), // Espera uma string de data (ex: "2025-10-23T12:00:00.000Z")
    mealType: z.string().min(3),
    foodName: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    kcal: z.number().min(0),
    protein: z.number().min(0),
    carbohydrates: z.number().min(0),
    lipids: z.number().min(0),
  });

  // --- Rota 1: CRIAR um novo registro no diário ---
  // POST /api/athletes/:athleteId/log
  app.post('/api/athletes/:athleteId/log', async (req, reply) => {
    // Valida o ID do atleta da URL
    const { athleteId } = z.object({
      athleteId: z.coerce.number().int(),
    }).parse(req.params);

    // Valida os dados da refeição enviados pelo frontend
    const body = logEntryBodySchema.parse(req.body);

    const logEntry = await prisma.dailyLogEntry.create({
      data: {
        athleteId: athleteId,
        eatenAt: new Date(body.eatenAt), // Converte a string de data em um objeto Date
        mealType: body.mealType,
        foodName: body.foodName,
        quantity: body.quantity,
        unit: body.unit,
        kcal: body.kcal,
        protein: body.protein,
        carbohydrates: body.carbohydrates,
        lipids: body.lipids,
      },
    });

    return reply.status(201).send(logEntry);
  });


  // --- Rota 2: LER o diário de um dia específico ---
  // GET /api/athletes/:athleteId/log?date=2025-10-23
  app.get('/api/athletes/:athleteId/log', async (req, reply) => {
    // Valida o ID do atleta
    const { athleteId } = z.object({
      athleteId: z.coerce.number().int(),
    }).parse(req.params);

    // Valida a data da query string
    const { date } = z.object({
      date: z.string().date(), // Espera formato "YYYY-MM-DD"
    }).parse(req.query);

    // Lógica de data: Buscar da 00:00:00 até 23:59:59 daquele dia
    // Importante: new Date('2025-10-23') pega o fuso horário local.
    // Usamos 'T00:00:00' para garantir que pegamos o início do dia em UTC.
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); // Adiciona 1 dia

    const logEntries = await prisma.dailyLogEntry.findMany({
      where: {
        athleteId: athleteId,
        eatenAt: {
          gte: startDate, // "greater than or equal to" (maior ou igual a)
          lt: endDate,    // "less than" (menor que o início do próximo dia)
        },
      },
      orderBy: {
        eatenAt: 'asc', // Ordena por hora
      },
    });

    return reply.send(logEntries);
  });
}