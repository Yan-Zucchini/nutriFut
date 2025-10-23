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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    };

    // --- Event Listeners para os Botões ---

    // Atletas
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
            name: document.getElementById('athleteName').value,
            email: document.getElementById('athleteEmail').value,
            weight: parseFloat(document.getElementById('athleteWeight').value),
            height: parseFloat(document.getElementById('athleteHeight').value)
        };
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
});