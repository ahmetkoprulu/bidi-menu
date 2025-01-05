CREATE TABLE menu_items (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    images TEXT[],
    status menu_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Modify menus table to include categories with items
ALTER TABLE menus 
ADD COLUMN menu_categories JSONB NOT NULL DEFAULT '[]';

-- Add GIN index for faster JSONB queries if needed
CREATE INDEX idx_menu_categories ON menus USING GIN (menu_categories);
CREATE INDEX idx_menu_items_client_id ON menu_items(client_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 