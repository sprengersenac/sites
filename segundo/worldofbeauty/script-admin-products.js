document.addEventListener('DOMContentLoaded', async () => {
    const productsTableBody = document.getElementById('products-table-body');
    const API_URL_BASE = 'http://localhost:3001/api';

    async function fetchAllProducts() {
        try {
            const response = await fetch(`${API_URL_BASE}/products/all`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            const products = await response.json();
            
            productsTableBody.innerHTML = '';

            if (products.length === 0) {
                productsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
                return;
            }

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.nome}</td>
                    <td>R$ ${parseFloat(product.preco).toFixed(2)}</td>
                    <td>${product.promocao ? 'Sim' : 'Não'}</td>
                    <td>${product.estoque}</td>
                    <td>
                        <a href="editar-produto.html?id=${product.id}" class="btn edit-btn">Editar</a>
                        <button class="btn delete-btn" data-id="${product.id}">Excluir</button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            productsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Não foi possível carregar os produtos.</td></tr>';
        }
    }

    productsTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const productId = e.target.dataset.id;
            if (confirm(`Tem certeza que deseja excluir o produto #${productId}?`)) {
                
                try {
                    const response = await fetch(`${API_URL_BASE}/products/${productId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        alert('Produto excluído com sucesso!');
                        fetchAllProducts();
                    } else {
                        const errorData = await response.json();
                        alert(`Erro ao excluir produto: ${errorData.error}`);
                    }

                } catch (error) {
                    console.error('Erro de conexão:', error);
                    alert('Erro ao se conectar com o servidor para excluir o produto.');
                }
            }
        }
    });

    fetchAllProducts();
});