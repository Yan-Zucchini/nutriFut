// src/database/index.ts

// Interfaces que definem a estrutura dos nossos dados
export interface Nutrients {
  kcal: number;
  protein: number;
  carbohydrates: number;
  lipids: number;
}

export interface Food {
  id: string;
  name: string;
  category: { // Mantemos o objeto categoria dentro do alimento
    id: string;
    name: string;
  };
  nutrients: Nutrients;
}

// A variável que vai guardar todos os dados da TACO API
export let allFoodsCache: Food[] = [];

// Função para popular nosso cache
export function setAllFoodsCache(data: Food[]) {
  allFoodsCache = data;
}