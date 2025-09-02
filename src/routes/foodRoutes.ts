// src/routes/foodRoutes.ts

import { FastifyInstance } from 'fastify';
import { allFoodsCache } from '../database/index.js'; // Usamos .js

export async function foodRoutes(app: FastifyInstance) {

  // Rota para listar todas as categorias disponíveis
  app.get('/api/categories', async (req, reply) => {
    const categoriesMap = new Map<string, string>();
    allFoodsCache.forEach(food => {
      categoriesMap.set(food.category.id, food.category.name);
    });
    const categories = Array.from(categoriesMap, ([id, name]) => ({ id, name }));
    return reply.send(categories);
  });

  // Rota de busca avançada de alimentos
  app.get('/api/foods', async (req, reply) => {
    const query = req.query as { name?: string, categoryId?: string };

    let filteredFoods = [...allFoodsCache]; // Começa com uma cópia de todos os alimentos

    // Filtra pelo NOME se o parâmetro for fornecido
    if (query.name) {
      filteredFoods = filteredFoods.filter(food => 
        food.name.toLowerCase().includes(query.name!.toLowerCase())
      );
    }

    // Filtra pelo ID da CATEGORIA se o parâmetro for fornecido
    if (query.categoryId) {
      filteredFoods = filteredFoods.filter(food => 
        food.category.id === query.categoryId
      );
    }
    
    return reply.send(filteredFoods);
  });
}