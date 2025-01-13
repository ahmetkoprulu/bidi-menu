package services

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type MenuService interface {
	SaveMenu(ctx context.Context, model models.Menu) (uuid.UUID, error)
	ScanMenu(ctx context.Context, clientID uuid.UUID, imagePaths []string) (*models.Menu, error)
	GetMenu(ctx context.Context, clientID uuid.UUID) ([]*models.MenuCategory, error)
	GetMenuById(ctx context.Context, id uuid.UUID) (*models.Menu, error)
	DeleteMenu(ctx context.Context, id uuid.UUID) error
}
