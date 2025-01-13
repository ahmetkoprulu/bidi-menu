package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/google/uuid"
)

type modelService struct {
	modelRepo repository.ModelRepository
}

func NewModelService(modelRepo repository.ModelRepository) services.ModelService {
	return &modelService{
		modelRepo: modelRepo,
	}
}

func (s *modelService) SaveModel(ctx context.Context, model models.Model, isCreate bool) (*uuid.UUID, error) {
	if isCreate {
		modelID, err := s.modelRepo.CreateModel(ctx, &model)
		if err != nil {
			return nil, fmt.Errorf("failed to create menu: %w", err)
		}

		return modelID, nil
	}

	err := s.modelRepo.UpdateModel(ctx, &model)
	if err != nil {
		return nil, fmt.Errorf("failed to update menu: %w", err)
	}

	return model.ID, nil
}

func (s *modelService) GetModel(ctx context.Context, modelID uuid.UUID) (models.Model, error) {
	model, err := s.modelRepo.GetModel(ctx, modelID)
	if err != nil {
		return models.Model{}, fmt.Errorf("failed to get model: %w", err)
	}

	return model, nil
}

func (s *modelService) GetModels(ctx context.Context, clientID uuid.UUID) ([]models.Model, error) {
	ms, err := s.modelRepo.GetModels(ctx, clientID)
	if err != nil {
		return []models.Model{}, fmt.Errorf("failed to get models: %w", err)
	}

	return ms, nil
}

func (s *modelService) DeleteModel(ctx context.Context, modelID uuid.UUID) error {
	err := s.modelRepo.DeleteModel(ctx, modelID)
	if err != nil {
		return fmt.Errorf("failed to delete model: %w", err)
	}

	return nil
}

func (s *modelService) GetModelById(ctx context.Context, modelID uuid.UUID) (models.Model, error) {
	model, err := s.modelRepo.GetModelById(ctx, modelID)
	if err != nil {
		return models.Model{}, fmt.Errorf("failed to get model: %w", err)
	}

	return model, nil
}
