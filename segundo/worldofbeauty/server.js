// Importando os pacotes necessários
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

// Middleware para processar JSON e habilitar o CORS
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota para servir imagens estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração da conexão com o banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'world_of_beauty',
    port: 3307
};

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ==========================================================
// ROTAS DO BACK-END
// ==========================================================

// ROTA DE CADASTRO DE NOVO USUÁRIO
app.post('/api/register', async (req, res) => {
    const { nome_completo, nome_usuario, email, cpf, senha } = req.body;
    if (!nome_completo || !nome_usuario || !email || !cpf || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [existingUser] = await connection.execute(
            'SELECT email, nome_usuario FROM usuarios WHERE email = ? OR nome_usuario = ?',
            [email, nome_usuario]
        );
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email ou nome de usuário já cadastrado.' });
        }
        const senha_hash = await bcrypt.hash(senha, 10);
        const [result] = await connection.execute(
            'INSERT INTO usuarios (nome_completo, nome_usuario, email, cpf, senha_hash) VALUES (?, ?, ?, ?, ?)',
            [nome_completo, nome_usuario, email, cpf, senha_hash]
        );
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA DE LOGIN
app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;
    if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT id, nome_completo, nome_usuario, email, senha_hash, permissao FROM usuarios WHERE email = ? OR nome_usuario = ?',
            [login, login]
        );
        const usuario = rows[0];
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: {
                id: usuario.id,
                nome: usuario.nome_completo,
                email: usuario.email,
                permissao: usuario.permissao
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA DE CADASTRO DE PRODUTO COM UPLOAD DE IMAGEM
app.post('/api/products', upload.single('imagem'), async (req, res) => {
    const { nome, preco, preco_promocional, descricao, estoque, id_subcategoria } = req.body;
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;
    if (!nome || !preco || !descricao || !id_subcategoria || !imagem_url || estoque === undefined) {
        return res.status(400).json({ error: 'Todos os campos, a imagem e o estoque são obrigatórios' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO produtos (nome, preco, preco_promocional, descricao, estoque, imagem_url, id_subcategoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, preco, preco_promocional || null, descricao, estoque, imagem_url, id_subcategoria]
        );
        res.status(201).json({ message: 'Produto cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA PARA BUSCAR TODOS OS PRODUTOS (para a página de administração)
app.get('/api/products/all', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT *, IF(preco_promocional IS NOT NULL, 1, 0) AS promocao FROM produtos');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar todos os produtos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA DE PRODUTOS POR CATEGORIA/SUBCATEGORIA
app.get('/api/products/by-category', async (req, res) => {
    const { category, subcategory } = req.query;
    let query = `
        SELECT p.*, IF(p.preco_promocional IS NOT NULL, 1, 0) AS promocao
        FROM produtos p
        JOIN subcategorias sc ON p.id_subcategoria = sc.id
        JOIN categorias c ON sc.id_categoria = c.id
        WHERE 1=1
    `;
    const params = [];
    if (category) {
        query += ` AND c.nome = ?`;
        params.push(category);
    }
    if (subcategory && subcategory !== 'tudo') {
        query += ` AND sc.nome = ?`;
        params.push(subcategory);
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar produtos por categoria:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA PARA BUSCAR UM ÚNICO PRODUTO POR ID
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT p.*, sc.id as id_subcategoria, c.id as id_categoria FROM produtos p JOIN subcategorias sc ON p.id_subcategoria = sc.id JOIN categorias c ON sc.id_categoria = c.id WHERE p.id = ?',
            [id]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Produto não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar produto por ID:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA PARA ATUALIZAR UM PRODUTO
app.put('/api/products/:id', upload.single('imagem'), async (req, res) => {
    const { id } = req.params;
    const { nome, preco, preco_promocional, descricao, estoque, id_subcategoria } = req.body;
    let imagem_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    let updateQuery = 'UPDATE produtos SET nome = ?, preco = ?, preco_promocional = ?, descricao = ?, estoque = ?, id_subcategoria = ?';
    const params = [nome, preco, preco_promocional || null, descricao, estoque, id_subcategoria];
    
    if (imagem_url) {
        updateQuery += ', imagem_url = ?';
        params.push(imagem_url);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(updateQuery, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA DE PRODUTOS EM PROMOÇÃO (Página Inicial)
app.get('/api/promotions', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM produtos WHERE preco_promocional IS NOT NULL');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar produtos em promoção:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTAS PARA CATEGORIAS E SUBCATEGORIAS
app.get('/api/categories', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, nome FROM categorias');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/subcategories', async (req, res) => {
    const { categoryId } = req.query;
    if (!categoryId) {
        return res.status(400).json({ error: 'ID da categoria é obrigatório' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, nome FROM subcategorias WHERE id_categoria = ?', [categoryId]);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA PARA BUSCAR TODOS OS USUÁRIOS (ÁREA DO ADMIN)
app.get('/api/users', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, nome_completo, email, cpf, permissao FROM usuarios');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA PARA EXCLUIR UM PRODUTO
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute('DELETE FROM produtos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA DE LOGIN
app.post('/api/login', async (req, res) => {
    const { login, senha } = req.body;
    if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT id, nome_completo, nome_usuario, email, senha_hash, permissao FROM usuarios WHERE email = ? OR nome_usuario = ?',
            [login, login]
        );
        const usuario = rows[0];
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: {
                id: usuario.id,
                nome: usuario.nome_completo,
                email: usuario.email,
                permissao: usuario.permissao
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA DE REGISTRO DE USUÁRIO
app.post('/api/register', async (req, res) => {
    const { nome_completo, nome_usuario, email, cpf, senha } = req.body;
    if (!nome_completo || !nome_usuario || !email || !cpf || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [existingUser] = await connection.execute(
            'SELECT email, nome_usuario FROM usuarios WHERE email = ? OR nome_usuario = ?',
            [email, nome_usuario]
        );
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email ou nome de usuário já cadastrado.' });
        }
        const senha_hash = await bcrypt.hash(senha, 10);
        const [result] = await connection.execute(
            'INSERT INTO usuarios (nome_completo, nome_usuario, email, cpf, senha_hash) VALUES (?, ?, ?, ?, ?)',
            [nome_completo, nome_usuario, email, cpf, senha_hash]
        );
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// INICIANDO O SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});