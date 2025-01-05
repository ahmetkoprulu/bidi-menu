package impl

import (
	"context"
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

func (r *menuRepository) GetCategoryWithItems(ctx context.Context, categoryID uuid.UUID) (*models.MenuCategory, error) {
	query := `
		SELECT categories
		FROM menus
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	var categories []*models.MenuCategory
	err := r.db.QueryRow(ctx, query, categoryID).Scan(&categories)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	for _, category := range categories {
		if category.ID == categoryID {
			return category, nil
		}
	}

	return nil, fmt.Errorf("category not found")
}

func (r *menuRepository) CreateCategory(ctx context.Context, category *models.MenuCategory) error {
	query := `
		UPDATE menus
		SET categories = COALESCE(categories, '[]'::jsonb) || $1::jsonb
		WHERE client_id = $2
	`

	result, err := r.db.Exec(ctx, query, []models.MenuCategory{*category}, category.ClientID)
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

func (r *menuRepository) CreateMenuItem(ctx context.Context, item *models.MenuItem) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(
				CASE
					WHEN c->>'id' = $1::text
					THEN jsonb_set(
						c,
						'{menuItems}',
						COALESCE(c->'menuItems', '[]'::jsonb) || $2::jsonb
					)
					ELSE c
				END
			)
			FROM jsonb_array_elements(categories) c
		)
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	result, err := r.db.Exec(ctx, query, []models.MenuItem{*item})
	if err != nil {
		return fmt.Errorf("failed to create menu item: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("category not found")
	}

	return nil
}

func (r *menuRepository) UpdateMenuItem(ctx context.Context, item *models.MenuItem) error {
	query := `
		UPDATE menus
		SET categories = (
			SELECT jsonb_agg(
				CASE
					WHEN c->>'id' = $1::text
					THEN jsonb_set(
						c,
						'{menuItems}',
						(
							SELECT jsonb_agg(
								CASE
									WHEN i->>'id' = $2::text
									THEN $3::jsonb
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
		WHERE categories @> '[{"id": "' || $1::text || '"}]'
	`

	result, err := r.db.Exec(ctx, query, item.ID, item)
	if err != nil {
		return fmt.Errorf("failed to update menu item: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("item not found")
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
