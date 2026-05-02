CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    pin_seguranca TEXT NOT NULL,
    data_nascimento TEXT,
    salario_atual REAL
);

CREATE TABLE IF NOT EXISTS Categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Transacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL, 
    descricao TEXT,
    usuario_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Orcamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    limite_valor REAL NOT NULL,
    mes_ano TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor_alvo REAL NOT NULL,
    valor_atual REAL DEFAULT 0.0,
    prazo TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Perfil_Investidor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_perfil TEXT NOT NULL,
    data_analise TEXT NOT NULL,
    usuario_id INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
);
