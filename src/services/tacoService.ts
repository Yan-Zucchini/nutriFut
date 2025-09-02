// src/services/tacoService.ts

import { setAllFoodsCache, Food } from '../database/index.js'; // Usamos .js na importação para compatibilidade com ES Modules

const TACO_API_URL = 'http://localhost:4000/graphql';

// Esta função busca todos os dados da API TACO e os armazena no nosso cache.
export async function loadTacoData() {
  console.log('Iniciando carregamento de dados da API TACO...');
  
  // A query mais completa que temos para buscar todos os alimentos de uma vez
  const query = `
    query GetAllFoodQuery {
      getAllFood {
        id
        name
        category {
          id
          name
        }
        nutrients {
          kcal
          protein
          carbohydrates
          lipids
        }
      }
    }
  `;

  try {
    const response = await fetch(TACO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados da TACO API: ${response.statusText}`);
    }

    const result = await response.json() as { data?: { getAllFood: Food[] } };
    
    if (result.data && result.data.getAllFood) {
      setAllFoodsCache(result.data.getAllFood);
      console.log(`Dados carregados com sucesso! ${result.data.getAllFood.length} alimentos na memória.`);
    }
  } catch (error) {
    console.error('Falha crítica ao carregar dados da API TACO.', error);
    process.exit(1);
  }
}