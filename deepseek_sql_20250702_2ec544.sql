-- Tabela para inversores
CREATE TABLE inversores (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    potencia FLOAT NOT NULL,
    overload FLOAT NOT NULL,
    v_min FLOAT NOT NULL,
    v_max FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para painéis
CREATE TABLE paineis (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    potencia FLOAT NOT NULL,
    voc FLOAT NOT NULL,
    vmp FLOAT NOT NULL,
    imp FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);