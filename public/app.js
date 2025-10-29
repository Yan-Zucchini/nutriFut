document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3333';
    const resultsPre = document.getElementById('results');

    // Função para mostrar resultados
    const showResult = (data) => {
        resultsPre.textContent = JSON.stringify(data, null, 2);
    };
    
    // Função genérica para Fetch
    const apiFetch = async (endpoint, method = 'GET', body = null) => {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (response.status === 204) { // No content for DELETE
                return { message: 'Operação bem-sucedida (Status 204 No Content)' };
            }
            const data = await response.json();
            if (!response.ok) {
                throw data; // Joga o erro (com 'issues' do Zod) para o catch
            }
            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            return { 
                error: error.message || 'Erro desconhecido', 
                issues: error.issues || null 
            };
        }
    };

    // --- Event Listeners para os Botões ---

    // Atletas (PUT e DELETE agora devem funcionar!)
    document.getElementById('btnListAthletes').addEventListener('click', async () => showResult(await apiFetch('/api/athletes')));
    document.getElementById('btnCreateAthlete').addEventListener('click', async () => {
        const body = {
            name: document.getElementById('athleteName').value,
            email: document.getElementById('athleteEmail').value,
            weight: parseFloat(document.getElementById('athleteWeight').value),
            height: parseFloat(document.getElementById('athleteHeight').value)
        };
        showResult(await apiFetch('/api/athletes', 'POST', body));
    });
    document.getElementById('btnUpdateAthlete').addEventListener('click', async () => {
        const id = document.getElementById('athleteId').value;
        const body = {
            name: document.getElementById('athleteName').value || undefined, // Envia undefined se vazio
            email: document.getElementById('athleteEmail').value || undefined,
            weight: parseFloat(document.getElementById('athleteWeight').value) || undefined,
            height: parseFloat(document.getElementById('athleteHeight').value) || undefined
        };
        // Filtra chaves 'undefined' para permitir updates parciais
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
        showResult(await apiFetch(`/api/athletes/${id}`, 'PUT', body));
    });
    document.getElementById('btnDeleteAthlete').addEventListener('click', async () => {
        const id = document.getElementById('athleteId').value;
        showResult(await apiFetch(`/api/athletes/${id}`, 'DELETE'));
    });

    // Planos
    document.getElementById('btnListPlans').addEventListener('click', async () => showResult(await apiFetch('/api/plans')));
    document.getElementById('btnGetPlan').addEventListener('click', async () => {
        const id = document.getElementById('planId').value;
        showResult(await apiFetch(`/api/plans/${id}`));
    });
    document.getElementById('btnCreatePlan').addEventListener('click', async () => {
        const body = { name: document.getElementById('planName').value };
        showResult(await apiFetch('/api/plans', 'POST', body));
    });
    document.getElementById('btnDeletePlan').addEventListener('click', async () => {
        const id = document.getElementById('planId').value;
        showResult(await apiFetch(`/api/plans/${id}`, 'DELETE'));
    });

    // Associação
    document.getElementById('btnAssocPlan').addEventListener('click', async () => {
        const athleteId = document.getElementById('assocAthleteId').value;
        const body = { planId: parseInt(document.getElementById('assocPlanId').value) };
        showResult(await apiFetch(`/api/athletes/${athleteId}/plans`, 'POST', body));
    });

    // Itens do Plano
    document.getElementById('btnCreateItem').addEventListener('click', async () => {
        const planId = document.getElementById('itemPlanId').value;
        const body = {
            foodId: document.getElementById('itemFoodId').value,
            foodName: document.getElementById('itemFoodName').value,
            quantity: parseFloat(document.getElementById('itemQuantity').value),
            unit: document.getElementById('itemUnit').value,
            mealType: document.getElementById('itemMealType').value,
        };
        showResult(await apiFetch(`/api/plans/${planId}/items`, 'POST', body));
    });
    document.getElementById('btnUpdateItem').addEventListener('click', async () => {
        const itemId = document.getElementById('itemId').value;
        const body = {
            quantity: parseFloat(document.getElementById('itemQuantity').value),
            unit: document.getElementById('itemUnit').value,
            mealType: document.getElementById('itemMealType').value,
        };
        showResult(await apiFetch(`/api/items/${itemId}`, 'PUT', body));
    });
    document.getElementById('btnDeleteItem').addEventListener('click', async () => {
        const itemId = document.getElementById('itemId').value;
        showResult(await apiFetch(`/api/items/${itemId}`, 'DELETE'));
    });

    // --- [NOVO] DIÁRIO ALIMENTAR ---

    document.getElementById('btnCreateLog').addEventListener('click', async () => {
        const athleteId = document.getElementById('logAthleteId').value;
        if (!athleteId) {
            showResult({ error: "ID do Atleta é obrigatório para criar um registro." });
            return;
        }

        // Converte o datetime-local para o formato ISO (string) que o Zod espera
        const localDateValue = document.getElementById('logEatenAt').value;
        const isoDate = localDateValue ? new Date(localDateValue).toISOString() : new Date().toISOString();

        const body = {
            eatenAt: isoDate,
            mealType: document.getElementById('logMealType').value,
            foodName: document.getElementById('logFoodName').value,
            quantity: parseFloat(document.getElementById('logQuantity').value),
            unit: document.getElementById('logUnit').value,
            kcal: parseFloat(document.getElementById('logKcal').value),
            protein: parseFloat(document.getElementById('logProtein').value),
            carbohydrates: parseFloat(document.getElementById('logCarbs').value),
            lipids: parseFloat(document.getElementById('logLipids').value),
        };
        showResult(await apiFetch(`/api/athletes/${athleteId}/log`, 'POST', body));
    });

    document.getElementById('btnGetLog').addEventListener('click', async () => {
        const athleteId = document.getElementById('logGetAthleteId').value;
        const date = document.getElementById('logGetDate').value;

        if (!athleteId || !date) {
            showResult({ error: "ID do Atleta e Data são obrigatórios para buscar." });
            return;
        }

        // A rota espera a data como query param
        showResult(await apiFetch(`/api/athletes/${athleteId}/log?date=${date}`, 'GET'));
    });

    document.getElementById('btnUpdateLog').addEventListener('click', async () => {
        const entryId = document.getElementById('logEntryId').value;
        if (!entryId) {
            showResult({ error: "ID do Registro é obrigatório para atualizar." });
            return;
        }

        // Converte o datetime-local para o formato ISO (string)
        const localDateValue = document.getElementById('logEatenAt').value;
        const isoDate = localDateValue ? new Date(localDateValue).toISOString() : undefined;

        // Pega todos os valores (permite atualização parcial)
        const body = {
            eatenAt: isoDate,
            mealType: document.getElementById('logMealType').value || undefined,
            foodName: document.getElementById('logFoodName').value || undefined,
            quantity: parseFloat(document.getElementById('logQuantity').value) || undefined,
            unit: document.getElementById('logUnit').value || undefined,
            kcal: parseFloat(document.getElementById('logKcal').value) || undefined,
            protein: parseFloat(document.getElementById('logProtein').value) || undefined,
            carbohydrates: parseFloat(document.getElementById('logCarbs').value) || undefined,
            lipids: parseFloat(document.getElementById('logLipids').value) || undefined,
        };

        // Filtra chaves 'undefined' para enviar só o que foi preenchido
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        showResult(await apiFetch(`/api/log/${entryId}`, 'PUT', body));
    });

    document.getElementById('btnDeleteLog').addEventListener('click', async () => {
        const entryId = document.getElementById('logEntryId').value;
        if (!entryId) {
            showResult({ error: "ID do Registro é obrigatório para deletar." });
            return;
        }
        showResult(await apiFetch(`/api/log/${entryId}`, 'DELETE'));
    });
});