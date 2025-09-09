document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('product-edit-form');
    const categoriaSelect = document.getElementById('categoria');
    const subcategoriaSelect = document.getElementById('subcategoria');
    const currentImagePreview = document.getElementById('current-image-preview');
    const API_URL_BASE = 'http://localhost:3001/api';

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert('ID do produto não encontrado.');
        window.location.href = 'admin-products.html';
        return;
    }
    document.getElementById('product-id').value = productId;

    async function loadCategories(selectedCategoryId = null) {
        try {
            const response = await fetch(`${API_URL_BASE}/categories`);
            const categories = await response.json();
            categoriaSelect.innerHTML = '<option value="">Selecione a Categoria</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nome;
                if (cat.id == selectedCategoryId) {
                    option.selected = true;
                }
                categoriaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            alert('Erro ao carregar categorias do servidor.', true);
        }
    }

    async function loadSubcategories(categoryId, selectedSubcategoryId = null) {
        subcategoriaSelect.innerHTML = '<option value="">Selecione a Subcategoria</option>';
        if (!categoryId) return;
        
        try {
            const response = await fetch(`${API_URL_BASE}/subcategories?categoryId=${categoryId}`);
            const subcategories = await response.json();
            subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.id;
                option.textContent = sub.nome;
                if (sub.id == selectedSubcategoryId) {
                    option.selected = true;
                }
                subcategoriaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar subcategorias:', error);
            alert('Erro ao carregar subcategorias do servidor.', true);
        }
    }

    async function fetchProductData(id) {
        try {
            const response = await fetch(`${API_URL_BASE}/products/${id}`);
            const product = await response.json();

            if (product) {
                document.getElementById('nome').value = product.nome;
                document.getElementById('preco').value = product.preco;
                document.getElementById('preco_promocional').value = product.preco_promocional;
                document.getElementById('descricao').value = product.descricao;
                document.getElementById('estoque').value = product.estoque;

                if (product.imagem_url) {
                    const img = document.createElement('img');
                    img.src = `http://localhost:3001${product.imagem_url}`;
                    currentImagePreview.innerHTML = `Imagem Atual: `;
                    currentImagePreview.appendChild(img);
                }

                await loadCategories(product.id_categoria);
                await loadSubcategories(product.id_categoria, product.id_subcategoria);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do produto:', error);
            alert('Erro ao buscar dados do produto.', true);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nome', document.getElementById('nome').value);
        formData.append('preco', parseFloat(document.getElementById('preco').value));
        const preco_promocional = document.getElementById('preco_promocional').value;
        if (preco_promocional) {
            formData.append('preco_promocional', parseFloat(preco_promocional));
        } else {
            formData.append('preco_promocional', '');
        }
        formData.append('descricao', document.getElementById('descricao').value);
        formData.append('estoque', parseInt(document.getElementById('estoque').value));
        formData.append('id_subcategoria', parseInt(document.getElementById('subcategoria').value));
        const imagemFile = document.getElementById('imagem').files[0];
        if (imagemFile) {
            formData.append('imagem', imagemFile);
        }

        try {
            const response = await fetch(`${API_URL_BASE}/products/${productId}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                alert('Produto atualizado com sucesso!');
                window.location.href = 'admin-products.html';
            } else {
                const errorData = await response.json();
                alert(`Erro ao atualizar produto: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro ao se conectar com o servidor. Tente novamente mais tarde.', true);
        }
    });

    categoriaSelect.addEventListener('change', (e) => {
        loadSubcategories(e.target.value);
    });

    await fetchProductData(productId);
});