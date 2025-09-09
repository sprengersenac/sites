document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('product-register-form');
    const categoriaSelect = document.getElementById('categoria');
    const subcategoriaSelect = document.getElementById('subcategoria');
    const API_URL_BASE = 'http://localhost:3001/api';

    async function loadCategories(selectedCategoryId = null) {
        try {
            const response = await fetch(`${API_URL_BASE}/categories`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
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
            alert('Erro ao carregar categorias do servidor. Verifique a conexão e o terminal.');
        }
    }

    async function loadSubcategories(categoryId, selectedSubcategoryId = null) {
        subcategoriaSelect.innerHTML = '<option value="">Selecione a Subcategoria</option>';
        if (!categoryId) return;
        
        try {
            const response = await fetch(`${API_URL_BASE}/subcategories?categoryId=${categoryId}`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
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
            alert('Erro ao carregar subcategorias do servidor. Verifique a conexão e o terminal.');
        }
    }

    categoriaSelect.addEventListener('change', (e) => {
        loadSubcategories(e.target.value);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nome', document.getElementById('nome').value);
        formData.append('preco', parseFloat(document.getElementById('preco').value));
        const preco_promocional = document.getElementById('preco_promocional').value;
        if (preco_promocional) {
            formData.append('preco_promocional', parseFloat(preco_promocional));
        }
        formData.append('descricao', document.getElementById('descricao').value);
        formData.append('estoque', parseInt(document.getElementById('estoque').value));
        formData.append('id_subcategoria', parseInt(document.getElementById('subcategoria').value));
        const imagemFile = document.getElementById('imagem').files[0];
        if (imagemFile) {
            formData.append('imagem', imagemFile);
        }

        try {
            const response = await fetch(`${API_URL_BASE}/products`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Produto cadastrado com sucesso!');
                form.reset();
                loadSubcategories(null);
                loadCategories();
            } else {
                const errorData = await response.json();
                alert(`Erro ao cadastrar: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro ao se conectar com o servidor. Verifique se o servidor está rodando na porta 3001.');
        }
    });

    loadCategories();
});