document.addEventListener('DOMContentLoaded', () => {
    const adminMenu = document.getElementById('admin-menu');
    const userProfileLink = document.getElementById('user-profile-link');
    const userPermission = localStorage.getItem('userPermission');

    // 1. Exibir o menu de admin se o usuário for 'admin'
    if (userPermission === 'admin') {
        adminMenu.style.display = 'block';
    }

    // 2. Mudar o comportamento do ícone de usuário
    if (userPermission) { // Se o usuário está logado
        userProfileLink.querySelector('a').href = 'perfil.html';
        
        // Exemplo: mostrar um dropdown com Sair
        userProfileLink.classList.add('dropdown');
        userProfileLink.innerHTML = `
            <a href="perfil.html" class="user-link"><i class="fa-solid fa-user"></i></a>
            <div class="dropdown-content">
                <a href="perfil.html">Meu Perfil</a>
                <a href="#" id="logout-btn">Sair</a>
            </div>
        `;
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('userPermission');
                localStorage.removeItem('cart');
                showMessage('Você foi desconectado!');
                window.location.href = 'index.html';
            });
        }
    }
});