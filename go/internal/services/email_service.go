package services

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
)

type EmailService interface {
	SendMagicLink(ctx context.Context, magicLink models.MagicLink) error
}
