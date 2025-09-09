document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const pageTitle = document.getElementById('page-title');
    const categoryTitle = document.getElementById('category-title');
    const API_URL_BASE = 'http://localhost:3001/api';

    // Funções para gerenciar o carrinho
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const cart = getCart();
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    function showMessage(message, isError = false) {
        let messageDiv = document.getElementById('global-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'global-message';
            document.body.appendChild(messageDiv);
        }
        messageDiv.textContent = message;
        messageDiv.style.backgroundColor = isError ? '#dc3545' : '#28a745';
        messageDiv.style.opacity = '1';

        setTimeout(() => {
            messageDiv.style.opacity = '0';
        }, 3000);
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatTitle(category, subcategory) {
        if (subcategory) {
            return `${capitalize(subcategory.replace(/-/g, ' '))} em ${capitalize(category.replace(/-/g, ' '))}`;
        }
        return capitalize(category.replace(/-/g, ' '));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const subcategory = urlParams.get('subcategory');

    if (category) {
        const titleText = formatTitle(category, subcategory);
        pageTitle.textContent = titleText;
        categoryTitle.textContent = `${titleText} - World Of Beauty`;
    } else {
        pageTitle.textContent = 'Todas as Categorias';
        categoryTitle.textContent = `Categorias - World Of Beauty`;
    }

    async function fetchProducts() {
        if (!category) {
            productsContainer.innerHTML = '<p class="info-message">Nenhuma categoria selecionada. Por favor, escolha uma categoria no menu.</p>';
            return;
        }

        try {
            productsContainer.innerHTML = '<p class="loading-message">Carregando produtos...</p>';

            const API_URL = `${API_URL_BASE}/products/by-category?category=${category}${subcategory ? `&subcategory=${subcategory}` : ''}`;

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            const products = await response.json();

            productsContainer.innerHTML = '';

            if (products.length === 0) {
                productsContainer.innerHTML = '<p class="no-products-message">Nenhum produto encontrado nesta categoria.</p>';
            } else {
                products.forEach(product => {
                    const productCard = createProductCard(product);
                    productsContainer.appendChild(productCard);
                });
            }
            updateCartCount();
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            productsContainer.innerHTML = '<p class="error-message">Não foi possível carregar os produtos. Verifique se o servidor está rodando.</p>';
        }
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const image = document.createElement('img');
        image.src = `http://localhost:3001${product.imagem_url}`;
        image.alt = product.nome;

        const name = document.createElement('h3');
        name.textContent = product.nome;

        const price = document.createElement('p');
        if (product.preco_promocional) {
            price.className = 'product-price-promo';
            price.innerHTML = `
                <span class="old-price">R$ ${parseFloat(product.preco).toFixed(2)}</span>
                <span class="new-price">R$ ${parseFloat(product.preco_promocional).toFixed(2)}</span>
            `;
        } else {
            price.textContent = `R$ ${parseFloat(product.preco).toFixed(2)}`;
        }

        const button = document.createElement('button');
        button.className = 'add-to-cart-btn';
        button.textContent = 'Adicionar ao Carrinho';

        button.addEventListener('click', () => {
            const cart = getCart();
            const existingItem = cart.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    nome: product.nome,
                    preco: product.preco_promocional || parseFloat(product.preco),
                    imagem_url: product.imagem_url,
                    quantity: 1
                });
            }
            saveCart(cart);
            updateCartCount();
            alert(`${product.nome} foi adicionado ao carrinho!`);
        });

        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(button);

        return card;
    }

    fetchProducts();
});