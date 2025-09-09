CREATE DATABASE world_of_beauty;

-- Usa o banco de dados recém-criado
USE world_of_beauty;

-- ==========================================================
-- TABELAS E RELAÇÕES
-- ==========================================================

-- Tabela de Categorias
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de Subcategorias (relacionada a Categorias)
CREATE TABLE subcategorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Tabela de Produtos (relacionada a Subcategorias)
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    imagem_url VARCHAR(255),
    promocao BOOLEAN DEFAULT 0,
    id_subcategoria INT,
    FOREIGN KEY (id_subcategoria) REFERENCES subcategorias(id) ON DELETE SET NULL
);

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    permissao VARCHAR(50) NOT NULL DEFAULT 'cliente',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pedidos (relacionada a Usuários)
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    status_pedido VARCHAR(50) NOT NULL DEFAULT 'Processando',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de Itens do Pedido (relacionada a Pedidos e Produtos)
CREATE TABLE itens_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_produto INT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id) ON DELETE SET NULL
);

INSERT INTO categorias (nome) VALUES
('Maquiagem'),
('Perfumes'),
('Skincare'),
('Cabelos');

-- Insere as subcategorias
INSERT INTO subcategorias (nome, id_categoria) VALUES
('Face', 1), ('Lábios', 1), ('Olhos', 1),
('Femininos', 2), ('Masculinos', 2),
('Tipos de Pele', 3), ('Hidratantes', 3),
('Feminino', 4), ('Masculino', 4);

-- Insere alguns produtos de exemplo
INSERT INTO produtos (nome, preco, descricao, imagem_url, promocao, id_subcategoria) VALUES
('Batom Rosa Encanto', 29.90, 'Batom de alta pigmentação com acabamento matte.', 'https://via.placeholder.com/300x300.png?text=Batom', 1, 2),
('Máscara de Cílios Volume Extremo', 45.50, 'Fórmula que garante cílios volumosos o dia todo.', 'https://via.placeholder.com/300x300.png?text=Mascara', 0, 3),
('Perfume Floral Importado', 189.00, 'Fragrância exclusiva com notas florais e amadeiradas.', 'https://via.placeholder.com/300x300.png?text=Perfume+Floral', 1, 4),
('Creme Hidratante Facial', 65.00, 'Hidratação profunda para todos os tipos de pele.', 'https://via.placeholder.com/300x300.png?text=Hidratante+Facial', 1, 7),
('Shampoo para Cabelos Femininos', 35.00, 'Shampoo com fórmula nutritiva para cabelos femininos.', 'https://via.placeholder.com/300x300.png?text=Shampoo', 0, 8);

-- Insere um usuário de exemplo (senha é '123')
INSERT INTO usuarios (nome_completo, nome_usuario, email, cpf, senha_hash, permissao) VALUES
('Usuário de Teste', 'testeuser', 'teste@email.com', '111.111.111-11', '$2a$10$Wq6fKjD2M.7W/n3x0gPjQO/2g1L2Zl6yG9wK5z/fG8O5X4Q4.B7R5W', 'cliente'),
('Admin Master', 'admin', 'admin@beauty.com', '000.000.000-00', '$2a$10$Wq6fKjD2M.7W/n3x0gPjQO/2g1L2Zl6yG9wK5z/fG8O5X4Q4.B7R5W', 'admin');
-- A senha criptografada acima é para a string '123'.