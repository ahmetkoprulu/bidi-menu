package repository

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type ModelRepository interface {
	CreateModel(ctx context.Context, model *models.Model) (*uuid.UUID, error)
	UpdateModel(ctx context.Context, model *models.Model) error
	GetModel(ctx context.Context, modelID uuid.UUID) (models.Model, error)
	GetModels(ctx context.Context, clientID uuid.UUID) ([]models.Model, error)
	DeleteModel(ctx context.Context, modelID uuid.UUID) error
	GetModelById(ctx context.Context, modelID uuid.UUID) (models.Model, error)
}
