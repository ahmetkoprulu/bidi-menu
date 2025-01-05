-- Drop triggers
-- DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
-- DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON menu_categories;
-- DROP TRIGGER IF EXISTS update_organization_profiles_updated_at ON organization_profiles;
-- DROP TRIGGER IF EXISTS update_users_updated_at ON users;
-- DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;

-- Drop function
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS models;
-- Drop types
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS menu_status CASCADE;
DROP TYPE IF EXISTS model_status CASCADE;