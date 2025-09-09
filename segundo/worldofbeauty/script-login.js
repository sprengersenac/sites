document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('user-login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailOrUsername = document.getElementById('email_login').value;
        const password = document.getElementById('senha_login').value;

        const loginData = {
            login: emailOrUsername,
            senha: password
        };

        try {
            const API_URL = 'http://localhost:3001/api/login';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Login realizado com sucesso!');
                
                // Salva a permissão do usuário no localStorage
                // A chave é 'userPermission' e o valor é 'admin' ou 'cliente'
                localStorage.setItem('userPermission', data.user.permissao); 

                // Redireciona para a página de perfil após o login
                window.location.href = 'index.html'; 
            } else {
                const errorData = await response.json();
                alert(`Erro ao fazer login: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro ao se conectar com o servidor. Tente novamente mais tarde.');
        }
    });
});