// src/routes/foodRoutes.ts
import { FastifyInstance } from 'fastify';
import { getAllTacoFoods, getTacoCategories } from '../services/tacoService.js'; // Lembre-se do .js!

export async function foodRoutes(app: FastifyInstance) {

  // Rota para listar todas as categorias disponíveis
  app.get('/api/categories', async (req, reply) => {
    const categories = getTacoCategories();
    return reply.send(categories);
  });

  // Rota de busca avançada de alimentos
  app.get('/api/foods', async (req, reply) => {
    
    // MUDANÇA AQUI: Mudamos 'name' para 'search' para bater com a URL
    const query = req.query as { search?: string, categoryId?: string };

    let filteredFoods = getAllTacoFoods();

    // MUDANÇA AQUI: Mudamos 'query.name' para 'query.search'
    if (query.search) {
      filteredFoods = filteredFoods.filter(food => 
        food.description.toLowerCase().includes(query.search!.toLowerCase())
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