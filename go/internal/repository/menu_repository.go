package repository

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type MenuRepository interface {
	CreateMenu(ctx context.Context, menu *models.Menu) (uuid.UUID, error)
	UpdateMenu(ctx context.Context, menu *models.Menu) error
	GetMenuWithCategories(ctx context.Context, clientID uuid.UUID) ([]*models.MenuCategory, error)
	GetMenuById(ctx context.Context, id uuid.UUID) (*models.Menu, error)
	DeleteMenu(ctx context.Context, id uuid.UUID) error
	CreateCategory(ctx context.Context, category *models.MenuCategory) error
	UpdateCategoryOrder(ctx context.Context, categoryID uuid.UUID, order int) error
	DeleteCategory(ctx context.Context, categoryID uuid.UUID) error
	DeleteMenuItem(ctx context.Context, itemID uuid.UUID) error
	UpdateItemImages(ctx context.Context, itemID uuid.UUID, images []string) error
	ReorderCategories(ctx context.Context, categoryOrders map[uuid.UUID]int) error
	UpdateCategoryStatus(ctx context.Context, categoryID uuid.UUID, status models.MenuStatus) error
	UpdateItemsStatus(ctx context.Context, itemIDs []uuid.UUID, status models.MenuStatus) error
	RemoveModelFromMenuItems(ctx context.Context, modelID uuid.UUID) error
}
