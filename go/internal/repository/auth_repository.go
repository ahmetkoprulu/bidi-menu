package repository

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type AuthRepository interface {
	Register(ctx context.Context, req *models.RegisterRequest) (*models.Client, error)
	Login(ctx context.Context, email, password string) (*models.Client, error)
	GetClientByEmail(ctx context.Context, email string) (*models.Client, error)
	GetClientByID(ctx context.Context, clientID uuid.UUID) (*models.Client, error)
	UpdatePassword(ctx context.Context, clientID uuid.UUID, hashedPassword string) error
	CompleteInit(ctx context.Context, token string, req *models.RegisterRequest) error
}
