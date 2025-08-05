document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');

    const performSearch = async () => {
        const searchTerm = searchInput.value.trim();

        if (!searchTerm) {
            alert('Por favor, digite um alimento para buscar.');
            return;
        }

        resultsContainer.innerHTML = '<p>Buscando...</p>';

        try {
            const response = await fetch(`/alimentos?name=${searchTerm}`);

            if (!response.ok) {
                throw new Error('A resposta do servidor não foi OK');
            }

            const foods = await response.json(); 

            resultsContainer.innerHTML = '';

            if (foods.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum alimento encontrado.</p>';
                return;
            }

            const ul = document.createElement('ul');
            foods.forEach(food => {
                const li = document.createElement('li');
                // ALTERADO: Exibe o nome e as calorias (kcal)
                li.textContent = `${food.name} - ${food.nutrients.kcal} kcal`;
                ul.appendChild(li);
            });

            resultsContainer.appendChild(ul);

        } catch (error) {
            console.error('Erro ao buscar alimentos:', error);
            resultsContainer.innerHTML = '<p>Ocorreu um erro ao buscar. Tente novamente.</p>';
        }
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});