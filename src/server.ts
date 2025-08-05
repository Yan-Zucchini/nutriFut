import Fastify from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';

// ALTERADO: A interface agora inclui os nutrientes
interface Food {
  name: string;
  nutrients: {
    kcal: number;
  };
}

// ALTERADO: A interface de resposta para usar a nova interface Food
interface TacoResponse {
  getFoodByName: Food[];
}

const app = Fastify({
  logger: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

const TACO_API_URL = 'http://localhost:4000/graphql';

app.get('/alimentos', async (req, reply) => {
  const query = req.query as { name?: string };

  if (!query.name) {
    return reply.status(400).send({ error: 'O parâmetro "name" é obrigatório.' });
  }

  // ALTERADO: A query agora pede também os nutrientes (kcal)
  const searchQuery = `
    query GetFoodByName($name: String!) {
      getFoodByName(name: $name) {
        name
        nutrients {
          kcal
        }
      }
    }
  `;

  try {
    const response = await fetch(TACO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        variables: { name: query.name },
      }),
    });

    if (!response.ok) {
      console.error('Erro na API TACO:', response.status, await response.text());
      throw new Error('A resposta da API TACO não foi bem-sucedida.');
    }

    const result = await response.json() as { data?: TacoResponse };
    
    if (result.data && result.data.getFoodByName) {
      return reply.send(result.data.getFoodByName);
    } else {
      return reply.send([]);
    }
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar dados na API TACO.' });
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3333 });
    app.log.info('Servidor HTTP rodando em http://localhost:3333');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();