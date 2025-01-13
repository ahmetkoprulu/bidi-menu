CREATE TYPE client_status AS ENUM ('active', 'inactive', 'trial');
CREATE TYPE menu_status AS ENUM ('active', 'inactive');
CREATE TYPE model_status AS ENUM ('active', 'inactive');

CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(255),
    status client_status NOT NULL DEFAULT 'trial',
    trial_end_date TIMESTAMP WITH TIME ZONE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50),
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menus (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    label VARCHAR(255) NOT NULL,
    description TEXT,
    status menu_status NOT NULL DEFAULT 'active',
    categories JSONB,
    customization JSONB,
    qr_customization JSONB,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE models (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    glb_file_path TEXT NOT NULL,
    usdz_file_path TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL,
    status model_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_menu_client_id ON menus(client_id);
CREATE INDEX idx_models_client_id ON models(client_id);
