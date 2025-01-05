DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;

DROP INDEX IF EXISTS idx_menu_categories;
ALTER TABLE menus DROP COLUMN menu_categories;

DROP TABLE IF EXISTS menu_items;

DROP FUNCTION IF EXISTS update_updated_at_column(); 