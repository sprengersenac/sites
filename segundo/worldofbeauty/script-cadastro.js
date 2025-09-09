document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('user-register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const nome_usuario = document.getElementById('nome_usuario').value;
        const email = document.getElementById('email').value;
        const cpf = document.getElementById('cpf').value;
        const senha = document.getElementById('senha').value;
        const confirmar_senha = document.getElementById('confirmar_senha').value;

        if (senha !== confirmar_senha) {
            showMessage('As senhas não coincidem!');
            return;
        }

        const userData = {
            nome_completo: nome,
            nome_usuario: nome_usuario,
            email: email,
            cpf: cpf,
            senha: senha
        };

        try {
            // A URL da sua futura API de cadastro de usuário
            const API_URL = 'http://localhost:3001/api/register';
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                showMessage('Cadastro realizado com sucesso!');
                window.location.href = 'index.html'; // Redireciona para a página inicial
            } else {
                const errorData = await response.json();
                showMessage(`Erro ao cadastrar: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            showMessage('Erro ao se conectar com o servidor. Tente novamente mais tarde.');
        }
    });
});