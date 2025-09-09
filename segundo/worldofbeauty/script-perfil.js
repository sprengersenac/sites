document.addEventListener('DOMContentLoaded', async () => {
    // A URL da sua futura API para buscar dados do usuário.
    // Lembre-se que essa rota precisará de autenticação no futuro.
    const API_URL = 'http://localhost:3000/api/user/profile';

    const userName = document.getElementById('user-name');
    const fullName = document.getElementById('full-name');
    const username = document.getElementById('username');
    const userEmail = document.getElementById('user-email');
    const userCpf = document.getElementById('user-cpf');
    const logoutBtn = document.getElementById('logout-btn');

    // Função para buscar os dados do usuário
    async function fetchUserProfile() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // No futuro, o token de autenticação será enviado aqui
                    // 'Authorization': 'Bearer ' + seu_token
                }
            });

            if (!response.ok) {
                // Em caso de erro, redireciona para a página de login
                showMessage('Sessão expirada ou não autenticada. Faça login novamente.');
                window.location.href = 'login.html'; // Assume que você terá uma página de login
                return;
            }

            const userData = await response.json();
            
            // Preenche os dados na página
            userName.textContent = userData.nome_completo.split(' ')[0]; // Mostra só o primeiro nome
            fullName.textContent = userData.nome_completo;
            username.textContent = userData.nome_usuario;
            userEmail.textContent = userData.email;
            userCpf.textContent = userData.cpf;

        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            // Mensagem de erro amigável
            userName.textContent = 'Erro';
            document.querySelector('.profile-info').innerHTML = '<p>Não foi possível carregar seus dados. Tente novamente mais tarde.</p>';
        }
    }

    // Lógica do botão de Sair
    logoutBtn.addEventListener('click', () => {
        // Futura lógica para remover o token de autenticação
       alert('Você foi desconectado!');
        window.location.href = 'index.html';
    });

    // Chama a função para buscar os dados quando a página carrega
    fetchUserProfile();
});