// src/routes/planRoutes.ts

import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';

export async function planRoutes(app: FastifyInstance) {

  // Rota para CRIAR um novo plano alimentar (agora como um modelo/template)
  app.post('/api/plans', async (req, reply) => {
    const { name } = req.body as { name: string };

    try {
      const newPlan = await prisma.mealPlan.create({
        data: { name },
      });
      return reply.status(201).send(newPlan);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno ao criar o plano alimentar.' });
    }
  });

  // Rota para ASSOCIAR um plano existente a um atleta
  app.post('/api/athletes/:athleteId/plans', async (req, reply) => {
    const { athleteId } = req.params as { athleteId: string };
    const { planId } = req.body as { planId: number };

    try {
      // Usamos 'update' no atleta para 'conectar' um plano existente
      const updatedAthlete = await prisma.athlete.update({
        where: { id: parseInt(athleteId) },
        data: {
          mealPlans: {
            // A mágica do Prisma para relações muitos-para-muitos
            connect: { id: planId },
          },
        },
      });
      return reply.status(200).send(updatedAthlete);
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: 'Erro: Atleta ou Plano não encontrado.' });
    }
  });
  
  // A rota para adicionar itens continua a mesma e funciona perfeitamente
  app.post('/api/plans/:planId/items', async (req, reply) => {
    const { planId } = req.params as { planId: string };
    const { foodId, foodName, quantity, unit, mealType } = req.body as {
      foodId: string;
      foodName: string;
      quantity: number;
      unit: string;
      mealType: string;
    };

    try {
      const newFoodItem = await prisma.foodItem.create({
        data: {
          mealPlanId: parseInt(planId),
          foodId,
          foodName,
          quantity,
          unit,
          mealType,
        }
      });
      return reply.status(201).send(newFoodItem);
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: 'Erro: Plano não encontrado.' });
    }
  });

  // Rota para BUSCAR um plano alimentar específico e todos os seus detalhes
  app.get('/api/plans/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    try {
      const plan = await prisma.mealPlan.findUnique({
        where: {
          id: parseInt(id),
        },
        // A mágica acontece aqui:
        include: {
          athletes: true, // Inclui a lista de atletas que usam este plano
          items: true,    // Inclui a lista de todos os alimentos neste plano
        },
      });

      if (!plan) {
        return reply.status(404).send({ message: 'Plano alimentar não encontrado.' });
      }

      return reply.send(plan);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: 'Erro interno ao buscar o plano alimentar.' });
    }
  });

  // Rota para ATUALIZAR um item de alimento específico de um plano
  app.put('/api/items/:itemId', async (req, reply) => {
    const { itemId } = req.params as { itemId: string };
    const { quantity, unit, mealType } = req.body as {
      quantity?: number;
      unit?: string;
      mealType?: string;
    };

    try {
      const updatedItem = await prisma.foodItem.update({
        where: { id: parseInt(itemId) },
        data: {
          quantity,
          unit,
          mealType,
        },
      });
      return reply.send(updatedItem);
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: 'Erro: Item de alimento não encontrado.' });
    }
  });

  // Rota para DELETAR um item de alimento específico de um plano
  app.delete('/api/items/:itemId', async (req, reply) => {
    const { itemId } = req.params as { itemId: string };

    try {
      await prisma.foodItem.delete({
        where: { id: parseInt(itemId) },
      });
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: 'Erro: Item de alimento não encontrado.' });
    }
  });

  // Rota para DELETAR um plano alimentar inteiro (e todos os seus itens)
  app.delete('/api/plans/:planId', async (req, reply) => {
    const { planId } = req.params as { planId: string };

    try {
      await prisma.mealPlan.delete({
        where: { id: parseInt(planId) },
      });
      return reply.status(204).send();
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: 'Erro: Plano alimentar não encontrado.' });
    }
  });


  app.get('/api/plans', async (req, reply) => {
    const plans = await prisma.mealPlan.findMany();
    return reply.send(plans);
  });
    
}