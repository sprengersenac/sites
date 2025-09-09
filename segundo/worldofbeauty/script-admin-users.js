document.addEventListener('DOMContentLoaded', async () => {
    const usersTableBody = document.getElementById('users-table-body');
    const API_URL_BASE = 'http://localhost:3001/api';

    async function fetchAllUsers() {
        try {
            const response = await fetch(`${API_URL_BASE}/users`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            const users = await response.json();
            
            usersTableBody.innerHTML = '';
            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum usuário cadastrado.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.nome_completo}</td>
                    <td>${user.email}</td>
                    <td>${user.cpf}</td>
                    <td>${user.permissao}</td>
                `;
                usersTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            usersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Não foi possível carregar os usuários.</td></tr>';
        }
    }

    fetchAllUsers();
});