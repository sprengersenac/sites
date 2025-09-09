document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    const API_URL_BASE = 'http://localhost:3001'; // URL base para as imagens

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.preco * item.quantity;
                subtotal += itemTotal;

                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <img src="${API_URL_BASE}${item.imagem_url}" alt="${item.nome}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4>${item.nome}</h4>
                        <p class="cart-item-price">R$ ${itemTotal.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="remove-item-btn" data-id="${item.id}">Remover</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemEl);
            });
        }

        subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        const shipping = 0;
        totalEl.textContent = `R$ ${(subtotal + shipping).toFixed(2)}`;
    }

    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.type === 'number') {
            const id = parseInt(e.target.dataset.id);
            const quantity = parseInt(e.target.value);
            const item = cart.find(i => i.id === id);

            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.id !== id);
                }
                saveCart();
                renderCart();
            }
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            const id = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== id);
            saveCart();
            renderCart();
        }
    });

    renderCart();
});