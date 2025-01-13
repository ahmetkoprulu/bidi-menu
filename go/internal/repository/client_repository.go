package repository

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type ClientRepository interface {
	InitClient(ctx context.Context, model *models.ClientInitRequest) (models.Client, error)
	GetClient(ctx context.Context, clientID uuid.UUID) (*models.Client, error)
	UpdateClient(ctx context.Context, client *models.Client) error
	UpdateClientStatus(ctx context.Context, clientID uuid.UUID, status models.ClientStatus) error
	UpdateClientLogo(ctx context.Context, clientID uuid.UUID, logo string) error
	GetClients(ctx context.Context, page, pageSize int) ([]*models.Client, int, error)
	GetClientsWithMenus(ctx context.Context, page, pageSize int) ([]*models.Client, int, error)
	SearchClients(ctx context.Context, query string, page, pageSize int) ([]*models.Client, int, error)
}
