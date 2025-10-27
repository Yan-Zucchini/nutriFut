// src/routes/athleteRoutes.ts

import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js'; // Importamos nosso cliente Prisma
import { z } from 'zod'; // Importamos o Zod para validação
import { Prisma } from '@prisma/client'; // Importamos os tipos de Erro do Prisma

export async function athleteRoutes(app: FastifyInstance) {

  // --- Esquemas de Validação (Zod) ---
  
  const athleteBodySchema = z.object({
    name: z.string().min(3, { message: "Nome precisa ter no mínimo 3 caracteres." }),
    email: z.string().email({ message: "Email inválido." }),
    height: z.number().positive().optional().nullable(), // altura em metros (ex: 1.80)
    weight: z.number().positive().optional().nullable(), // peso em kg (ex: 75.5)
  });

  const athleteParamsSchema = z.object({
    id: z.coerce.number().int().positive(), // 'coerce' força a string da URL a virar número
  });

  // --- Rota para CRIAR um novo atleta (POST) ---
  app.post('/api/athletes', async (req, reply) => {
    try {
      // 1. Validar o corpo da requisição
      const { name, email, height, weight } = athleteBodySchema.parse(req.body);

      // 2. Criar o atleta no banco
      const newAthlete = await prisma.athlete.create({
        data: {
          name,
          email,
          heightInMeters: height, // Mapeamento correto
          weightInKg: weight,     // Mapeamento correto
        },
      });
      return reply.status(201).send(newAthlete);
    } catch (error) {
      // Se a validação do Zod falhar
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Erro de validação.', issues: error.format() });
      }
     
      // Se for um erro conhecido do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // --- CORRIGIDO AQUI ---
        // Verificamos se 'error.meta.target' existe E se é um array antes de usar .includes()
        if (error.code === 'P2002' && error.meta && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
           return reply.status(409).send({ message: 'Erro: Email já cadastrado.' });
        }
      }
      
      // Se for qualquer outro erro
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });

  // --- Rota para LISTAR todos os atletas (GET) ---
  app.get('/api/athletes', async (req, reply) => {
    const athletes = await prisma.athlete.findMany();
    return reply.send(athletes);
  });

  // --- Rota para BUSCAR um atleta específico pelo ID (GET) ---
  app.get('/api/athletes/:id', async (req, reply) => {
    try {
      // 1. Validar o ID da URL
      const { id } = athleteParamsSchema.parse(req.params);

      // 2. Buscar o atleta
      const athlete = await prisma.athlete.findUnique({
        where: { id: id },
      });

      if (!athlete) {
        return reply.status(404).send({ message: 'Atleta não encontrado.' }); // 404 Not Found
      }
      return reply.send(athlete);

    } catch (error) {
      // Se a validação do Zod falhar (ex: ID não é um número)
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'ID inválido.', issues: error.format() });
      }
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });

  // --- [NOVA] Rota para ATUALIZAR um atleta (PUT) ---
  app.put('/api/athletes/:id', async (req, reply) => {
    try {
      // 1. Validar o ID da URL
      const { id } = athleteParamsSchema.parse(req.params);
      
      // 2. Validar o corpo da requisição
      const body = athleteBodySchema.partial().parse(req.body);

      // 3. Atualizar o atleta no banco
      const updatedAthlete = await prisma.athlete.update({
        where: { id: id },
        data: {
          name: body.name,
          email: body.email,
          heightInMeters: body.height, // Mapeamento correto
          weightInKg: body.weight,     // Mapeamento correto
        },
      });

      return reply.send(updatedAthlete);
    } catch (error) {
      // Se a validação do Zod falhar
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Erro de validação.', issues: error.format() });
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Se o atleta não for encontrado (P2025)
        if (error.code === 'P2025') {
           return reply.status(404).send({ message: 'Atleta não encontrado.' });
        }
        
        // --- CORRIGIDO AQUI ---
        // Verificamos também se é um array
        if (error.code === 'P2002' && error.meta && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
           return reply.status(409).send({ message: 'Erro: Email já cadastrado por outro usuário.' });
        }
      }

      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });


  // --- [NOVA] Rota para DELETAR um atleta (DELETE) ---
  app.delete('/api/athletes/:id', async (req, reply) => {
    try {
      // 1. Validar o ID da URL
      const { id } = athleteParamsSchema.parse(req.params);

      // 2. Deletar o atleta
      await prisma.athlete.delete({
        where: { id: id },
      });

      // 3. Retornar uma resposta vazia com status "No Content"
      return reply.status(204).send();

    } catch (error) {
      // Se a validação do Zod falhar
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'ID inválido.', issues: error.format() });
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Se o atleta não for encontrado (P2025)
        if (error.code === 'P2025') {
           return reply.status(404).send({ message: 'Atleta não encontrado.' });
        }
      }

      console.error(error);
      return reply.status(500).send({ message: 'Erro interno no servidor.' });
    }
  });

} // Fim da função athleteRoutes