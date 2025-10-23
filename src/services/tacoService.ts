import csvtojson from 'csvtojson';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Interfaces (Agora refletem a estrutura real) ---
interface Category {
  id: string;
  name: string;
}

// Interface auxiliar para os nutrientes
interface Nutrients {
  kcal: number;
  protein: number;
  lipids: number;
  carbohydrates: number;
}

// A Interface final do nosso Alimento (completa)
interface TacoFood {
  id: string;
  description: string; // Veio do food.csv (coluna 'name')
  category: Category;  // Veio do categories.csv
  // Nutrientes, vieram do nutrients.csv
  kcal: number;
  protein: number;
  lipids: number;
  carbohydrates: number;
}

// --- Caches na Memória ---
let tacoMemoryCache: TacoFood[] = [];
let categoriesCache: Category[] = [];

// --- Caminhos para os Arquivos ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TACO_DATA_PATH = path.resolve(__dirname, '..', '..', 'taco-data');
const FOOD_CSV_PATH = path.join(TACO_DATA_PATH, 'food.csv');
const CATEGORIES_CSV_PATH = path.join(TACO_DATA_PATH, 'categories.csv');
const NUTRIENTS_CSV_PATH = path.join(TACO_DATA_PATH, 'nutrients.csv');


/**
 * Carrega e combina dados dos 3 arquivos CSV (foods, categories, nutrients).
 */
export async function loadTacoData(): Promise<void> {
  try {
    console.log('Iniciando carregamento de dados da TACO (3 arquivos CSV)...');

    // 1. Carrega CATEGORIAS
    const categoriesFromCsv = await csvtojson().fromFile(CATEGORIES_CSV_PATH);
    const categoriesMap = new Map<string, Category>();
    categoriesCache = categoriesFromCsv.map((cat: any) => {
      const category: Category = { id: cat.id, name: cat.name };
      categoriesMap.set(category.id, category);
      return category;
    });
    console.log(`- ${categoriesCache.length} categorias carregadas.`);

    // 2. Carrega NUTRIENTES
    const nutrientsFromCsv = await csvtojson().fromFile(NUTRIENTS_CSV_PATH);
    const nutrientsMap = new Map<string, Nutrients>();
    nutrientsFromCsv.forEach((nut: any) => {
      nutrientsMap.set(nut.foodId, {
        kcal: parseFloat(nut.kcal) || 0,
        protein: parseFloat(nut.protein) || 0,
        lipids: parseFloat(nut.lipids) || 0,
        carbohydrates: parseFloat(nut.carbohydrates) || 0,
      });
    });
    console.log(`- ${nutrientsMap.size} registros de nutrientes carregados.`);

    // 3. Carrega ALIMENTOS (o principal) e COMBINA TUDO
    const foodFromCsv = await csvtojson().fromFile(FOOD_CSV_PATH);

    const defaultCategory: Category = { id: '?', name: 'Desconhecida' };
    const defaultNutrients: Nutrients = { kcal: 0, protein: 0, lipids: 0, carbohydrates: 0 };

    tacoMemoryCache = foodFromCsv.map((food: any) => {
      // Busca a categoria deste alimento no Mapa de categorias
      const category = categoriesMap.get(food.categoryId) || defaultCategory;
      
      // Busca os nutrientes deste alimento no Mapa de nutrientes
      const nutrients = nutrientsMap.get(food.id) || defaultNutrients;

      // Monta o objeto final e completo
      return {
        id: food.id,
        description: food.name, // Usando a coluna 'name' do food.csv
        category: category,      // Objeto da categoria
        ...nutrients             // Adiciona kcal, protein, lipids, carbohydrates
      };
    });

    console.log(`- ${tacoMemoryCache.length} alimentos carregados e combinados.`);
    console.log('Dados da TACO carregados com sucesso!');
  
  } catch (err) {
    console.error('Falha crítica ao carregar dados da TACO (CSV).', err);
    console.error(`Verifique se 'food.csv', 'categories.csv' e 'nutrients.csv' existem em 'taco-data/'.`);
    process.exit(1); 
  }
}

/**
 * Retorna todos os alimentos da TACO (com categorias) que estão na memória.
 */
export function getAllTacoFoods(): TacoFood[] {
  return tacoMemoryCache;
}

/**
 * Retorna todas as categorias que estão na memória.
 */
export function getTacoCategories(): Category[] {
  return categoriesCache;
}