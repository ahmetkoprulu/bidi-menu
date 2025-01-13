package impl

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/google/uuid"
)

type menuRepository struct {
	db *data.PgDbContext
}

func NewMenuRepository(db *data.PgDbContext) repository.MenuRepository {
	return &menuRepository{db: db}
}

func (r *menuRepository) DeleteMenu(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM menus
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	return nil
}

func (r *menuRepository) GetMenuById(ctx context.Context, id uuid.UUID) (*models.Menu, error) {
	query := `
		WITH menu_data AS (
			SELECT id, client_id, label, description, status, categories
			FROM menus
			WHERE id = $1
		),
		menu_with_models AS (
			SELECT 
				md.*,
				jsonb_agg(
					DISTINCT jsonb_build_object(
						'id', m.id,
						'clientId', m.client_id,
						'name', m.name,
						'thumbnail', m.thumbnail,
						'glbFile', m.glb_file,
						'usdzFile', m.usdz_file,
						'createdAt', m.created_at,
						'updatedAt', m.updated_at
					)
				) FILTER (WHERE m.id IS NOT NULL) as model_list
			FROM menu_data md
			LEFT JOIN LATERAL jsonb_array_elements(md.categories::jsonb) as cat ON true
			LEFT JOIN LATERAL jsonb_array_elements(cat->'menuItems') as items ON true
			LEFT JOIN models m ON m.id::text = items->>'modelId'
			GROUP BY md.id, md.client_id, md.label, md.description, md.status, md.categories
		)
		SELECT 
			id, client_id, label, description, status,
			CASE 
				WHEN categories IS NULL THEN '[]'::jsonb
				ELSE categories::jsonb
			END as categories,
			COALESCE(model_list, '[]'::jsonb) as models
		FROM menu_with_models
	`

	var menu models.Menu
	var categoriesJSON, modelsJSON []byte
	err := r.db.QueryRow(ctx, query, id).Scan(
		&menu.ID,
		&menu.ClientID,
		&menu.Label,
		&menu.Description,
		&menu.Status,
		&categoriesJSON,
		&modelsJSON,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get menu: %w", err)
	}

	// Parse the models
	var modelList []*models.Model
	if err := json.Unmarshal(modelsJSON, &modelList); err != nil {
		return nil, fmt.Errorf("failed to parse models: %w", err)
	}

	// Create a map for quick model lookups
	modelMap := make(map[string]*models.Model)
	for _, model := range modelList {
		if model.ID != nil {
			modelMap[model.ID.String()] = model
		}
	}

	// Parse categories
	var categories []*models.MenuCategory
	if err := json.Unmarshal(categoriesJSON, &categories); err != nil {
		return nil, fmt.Errorf("failed to parse categories: %w", err)
	}

	// Update menu items with model information
	for _, category := range categories {
		for _, item := range category.MenuItems {
			if item.ModelID != nil {
				if model, ok := modelMap[item.ModelID.String()]; ok {
					// Add model information to the menu item
					item.Model = model
				}
			}
		}
	}

	menu.Categories = categories
	return &menu, nil
}

func (r *menuRepository) CreateMenu(ctx context.Context, menu *models.Menu) (uuid.UUID, error) {
	query := `
		INSERT INTO menus (id, client_id, label, description, status, categories)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	id := uuid.New()
	menu.ID = &id
	err := r.db.QueryRow(ctx, query, menu.ID, menu.ClientID, menu.Label, menu.Description, menu.Status, menu.Categories).Scan(&menu.ID)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to create menu: %w", err)
	}

	return *menu.ID, nil
}

func (r *menuRepository) UpdateMenu(ctx context.Context, menu *models.Menu) error {
	query := `
		UPDATE menus
		SET label = $2, description = $3, status = $4, categories = $5
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, menu.ID, menu.Label, menu.Description, menu.Status, menu.Categories)
	if err != nil {
		return fmt.Errorf("failed to update menu: %w", err)
	}

	return nil
}

func (r *menuRepository) GetMenuWithCategories(ctx context.Context, clientID uuid.UUID) ([]*models.MenuCategory, error) {
	query := `
		SELECT categories
		FROM menus
		WHERE client_id = $1
	`

	var categories []*models.MenuCategory
	err := r.db.QueryRow(ctx, query, clientID).Scan(&categories)
	if err != nil {
		return nil, fmt.Errorf("failed to get menu categories: %w", err)
	}

	return categories, nil
}

func (r *menuRepository) CreateCategory(ctx context.Context, category *models.MenuCategory) error {
	query := `
		UPDATE menus
		SET categories = COALESCE(categories, '[]'::jsonb) || $1::jsonb
		WHERE client_id = $2
	`

	result, err := r.db.Exec(ctx, query, []models.MenuCategory{*category})
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("menu not found")
	}

	return nil
}

func (r *menuRepository) UpdateCategoryOrder(ctx context.Context, categoryID uuid.UUID, order int) error {
	// Since we're using JSONB array, we need to update the entire categories array
	// First, get the current categories
	query := `
		SELECT categories
		FROM menus
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	var categories []*models.MenuCategory
	err := r.db.QueryRow(ctx, query, categoryID).Scan(&categories)
	if err != nil {
		return fmt.Errorf("failed to get categories: %w", err)
	}

	// Update the categories in the menu
	updateQuery := `
		UPDATE menus
		SET categories = $1
		WHERE categories @> '[{"id": "' || $2::text || '"}]'
	`

	result, err := r.db.Exec(ctx, updateQuery, categories, categoryID)
	if err != nil {
		return fmt.Errorf("failed to update category order: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("menu not found")
	}

	return nil
}

func (r *menuRepository) DeleteCategory(ctx context.Context, categoryID uuid.UUID) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(c)
			FROM jsonb_array_elements(categories) c
			WHERE c->>'id' != $1::text
		)
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	result, err := r.db.Exec(ctx, query, categoryID)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("category not found")
	}

	return nil
}

func (r *menuRepository) DeleteMenuItem(ctx context.Context, itemID uuid.UUID) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(
				CASE
					WHEN c->'menuItems' @> '[{"id": "' || $1::text || '"}]'
					THEN jsonb_set(
						c,
						'{menuItems}',
						(
							SELECT jsonb_agg(i)
							FROM jsonb_array_elements(c->'menuItems') i
							WHERE i->>'id' != $1::text
						)
					)
					ELSE c
				END
			)
			FROM jsonb_array_elements(categories) c
		)
		WHERE categories @> '[{"menuItems": [{"id": "' || $1::text || '"}]}]'
	`

	result, err := r.db.Exec(ctx, query, itemID)
	if err != nil {
		return fmt.Errorf("failed to delete menu item: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("item not found")
	}

	return nil
}

func (r *menuRepository) UpdateItemImages(ctx context.Context, itemID uuid.UUID, images []string) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(
				CASE
					WHEN c->'menuItems' @> '[{"id": "' || $1::text || '"}]'
					THEN jsonb_set(
						c,
						'{menuItems}',
						(
							SELECT jsonb_agg(
								CASE
									WHEN i->>'id' = $1::text
									THEN jsonb_set(i, '{images}', $2::jsonb)
									ELSE i
								END
							)
							FROM jsonb_array_elements(c->'menuItems') i
						)
					)
					ELSE c
				END
			)
			FROM jsonb_array_elements(categories) c
		)
		WHERE categories @> '[{"menuItems": [{"id": "' || $1::text || '"}]}]'
	`

	result, err := r.db.Exec(ctx, query, itemID, images)
	if err != nil {
		return fmt.Errorf("failed to update item images: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("item not found")
	}

	return nil
}

func (r *menuRepository) ReorderCategories(ctx context.Context, categoryOrders map[uuid.UUID]int) error {
	// First, get the current categories
	query := `
		SELECT categories
		FROM menus
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	var categories []*models.MenuCategory
	err := r.db.QueryRow(ctx, query, categoryOrders).Scan(&categories)
	if err != nil {
		return fmt.Errorf("failed to get categories: %w", err)
	}

	// Update the categories in the menu
	updateQuery := `
		UPDATE menus
		SET categories = $1
		WHERE categories @> '[{"id": "' || $2::text || '"}]'
	`

	result, err := r.db.Exec(ctx, updateQuery, categories, categoryOrders)
	if err != nil {
		return fmt.Errorf("failed to reorder categories: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("menu not found")
	}

	return nil
}

func (r *menuRepository) UpdateCategoryStatus(ctx context.Context, categoryID uuid.UUID, status models.MenuStatus) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(
				CASE
					WHEN c->>'id' = $1::text
					THEN jsonb_set(
						jsonb_set(
							c,
							'{status}',
							'"' || $2::text || '"'
						),
						'{menuItems}',
						(
							SELECT jsonb_agg(
								jsonb_set(i, '{status}', '"' || $2::text || '"')
							)
							FROM jsonb_array_elements(c->'menuItems') i
						)
					)
					ELSE c
				END
			)
			FROM jsonb_array_elements(categories) c
		)
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	result, err := r.db.Exec(ctx, query, categoryID, status)
	if err != nil {
		return fmt.Errorf("failed to update category status: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("category not found")
	}

	return nil
}

func (r *menuRepository) UpdateItemsStatus(ctx context.Context, itemIDs []uuid.UUID, status models.MenuStatus) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(
				CASE
					WHEN c->'menuItems' @> ANY(ARRAY(
						SELECT jsonb_build_object('id', id)::jsonb
						FROM unnest($1::uuid[]) id
					))
					THEN jsonb_set(
						c,
						'{menuItems}',
						(
							SELECT jsonb_agg(
								CASE
									WHEN i->>'id' = ANY($1::text[])
									THEN jsonb_set(i, '{status}', '"' || $2::text || '"')
									ELSE i
								END
							)
							FROM jsonb_array_elements(c->'menuItems') i
						)
					)
					ELSE c
				END
			)
			FROM jsonb_array_elements(categories) c
		)
		WHERE categories @> ANY(ARRAY(
			SELECT jsonb_build_object('menuItems', jsonb_build_array(jsonb_build_object('id', id)))::jsonb
			FROM unnest($1::uuid[]) id
		))
	`

	result, err := r.db.Exec(ctx, query, itemIDs, status)
	if err != nil {
		return fmt.Errorf("failed to update items status: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("no items found")
	}

	return nil
}
