package repository

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type MagicLinkRepository interface {
	Create(ctx context.Context, magicLink *models.MagicLink) error
	GetByToken(ctx context.Context, token string) (*models.MagicLink, error)
	GetByEmail(ctx context.Context, email string) (*models.MagicLink, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status models.MagicLinkStatus) error
	DeleteExpired(ctx context.Context) error
}
