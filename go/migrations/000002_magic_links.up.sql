CREATE TYPE magic_link_status AS ENUM ('pending', 'used', 'expired');
CREATE TYPE magic_link_purpose AS ENUM ('init','login', 'password_reset', 'email_verification');

CREATE TABLE magic_links (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    purpose magic_link_purpose NOT NULL DEFAULT 'init',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status magic_link_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_magic_links_client_id ON magic_links(client_id); 