package services

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type AuthService interface {
	Register(ctx context.Context, req *models.RegisterRequest) (*models.Client, error)
	Login(ctx context.Context, email, password string) (*models.Client, string, error)
	CompleteInit(ctx context.Context, token string, req *models.RegisterRequest) error
	ValidateToken(ctx context.Context, token string) (*models.Client, *utils.Claims, error)
	ResetPassword(ctx context.Context, clientID uuid.UUID, currentPassword, newPassword string) error
	GenerateToken(ctx context.Context, client *models.Client) (string, error)
}
