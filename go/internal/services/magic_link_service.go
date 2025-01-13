package services

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
)

type MagicLinkService interface {
	CreateMagicLink(ctx context.Context, req *models.CreateMagicLinkRequest) (*models.MagicLink, error)
	ValidateMagicLink(ctx context.Context, token string) (*models.MagicLink, error)
}
