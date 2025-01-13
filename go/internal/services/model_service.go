package services

import (
	"context"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/google/uuid"
)

type ModelService interface {
	SaveModel(ctx context.Context, model models.Model, isCreate bool) (*uuid.UUID, error)
	GetModel(ctx context.Context, modelID uuid.UUID) (models.Model, error)
	GetModels(ctx context.Context, clientID uuid.UUID) ([]models.Model, error)
	DeleteModel(ctx context.Context, modelID uuid.UUID) error
	GetModelById(ctx context.Context, modelID uuid.UUID) (models.Model, error)
}
