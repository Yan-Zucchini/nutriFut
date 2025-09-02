// src/routes/athleteRoutes.ts

import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js'; // Importamos nosso cliente Prisma

export async function athleteRoutes(app: FastifyInstance) {

  // Rota para CRIAR um novo atleta
  app.post('/api/athletes', async (req, reply) => {
    // Definimos o tipo de dados que esperamos receber no corpo da requisição
    const { name, email, height, weight } = req.body as { name: string, email: string, height?: number, weight?: number };

    try {
      const newAthlete = await prisma.athlete.create({
        data: {
          name,
          email,
          height,
          weight,
        },
      });
      // Retorna o atleta recém-criado com status 201 (Created)
      return reply.status(201).send(newAthlete);
    } catch (error) {
      // Trata o erro caso o email já exista (devido ao @unique no schema)
      console.error(error);
      return reply.status(409).send({ message: 'Erro: Email já cadastrado.' }); // 409 Conflict
    }
  });

  // Rota para LISTAR todos os atletas
  app.get('/api/athletes', async (req, reply) => {
    const athletes = await prisma.athlete.findMany();
    return reply.send(athletes);
  });

  // Rota para BUSCAR um atleta específico pelo ID
  app.get('/api/athletes/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const athlete = await prisma.athlete.findUnique({
      where: {
        id: parseInt(id), // Convertemos o ID de string para número
      },
    });

    if (!athlete) {
      return reply.status(404).send({ message: 'Atleta não encontrado.' }); // 404 Not Found
    }

    return reply.send(athlete);
  });

  // Por enquanto, vamos focar nessas três rotas principais.
  // As rotas de ATUALIZAR (PUT) e DELETAR (DELETE) podemos adicionar depois.
}