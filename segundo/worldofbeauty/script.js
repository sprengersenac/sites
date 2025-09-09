document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3001/api/promotions';
    const productsContainer = document.getElementById('products-container');

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

    async function fetchProducts() {
        try {
            productsContainer.innerHTML = '<p class="loading-message">Carregando produtos...</p>';

            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            const products = await response.json();
            productsContainer.innerHTML = '';

            if (products.length === 0) {
                productsContainer.innerHTML = '<p class="no-products-message">Nenhum produto em promoção no momento.</p>';
            } else {
                products.forEach(product => {
                    const productCard = createProductCard(product);
                    productsContainer.appendChild(productCard);
                });
            }
            updateCartCount();
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            productsContainer.innerHTML = '<p class="error-message">Não foi possível carregar os produtos.</p>';
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