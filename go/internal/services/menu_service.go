package services

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type MenuService interface {
	ScanMenu(ctx context.Context, clientID uuid.UUID, imagePaths []string) (*models.Menu, error)
	GetMenu(ctx context.Context, clientID uuid.UUID) ([]*models.MenuCategory, error)
	GetCategory(ctx context.Context, categoryID uuid.UUID) (*models.MenuCategory, error)
	CreateCategory(ctx context.Context, clientID uuid.UUID, name string) error
	UpdateCategoryOrder(ctx context.Context, categoryID uuid.UUID, order int) error
	DeleteCategory(ctx context.Context, categoryID uuid.UUID) error
	CreateMenuItem(ctx context.Context, clientID, categoryID uuid.UUID, name, description string, price float64) error
	UpdateMenuItem(ctx context.Context, itemID uuid.UUID, name, description string, price float64) error
	DeleteMenuItem(ctx context.Context, itemID uuid.UUID) error
	UpdateItemImages(ctx context.Context, itemID uuid.UUID, images []string) error
	ReorderCategories(ctx context.Context, categoryOrders map[uuid.UUID]int) error
	UpdateCategoryStatus(ctx context.Context, categoryID uuid.UUID, status models.MenuStatus) error
	UpdateItemsStatus(ctx context.Context, itemIDs []uuid.UUID, status models.MenuStatus) error
}
