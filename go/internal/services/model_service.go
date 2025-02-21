package services

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/google/uuid"
)

type ModelService interface {
	SaveModel(ctx context.Context, model models.Model, isCreate bool) (*uuid.UUID, error)
	GetModel(ctx context.Context, modelID uuid.UUID) (models.Model, error)
	GetModels(ctx context.Context, clientID uuid.UUID) ([]models.Model, error)
	GetModelById(ctx context.Context, modelID uuid.UUID) (models.Model, error)
	DeleteModel(ctx context.Context, modelID uuid.UUID) error
}

type modelService struct {
	modelRepo repository.ModelRepository
	menuRepo  repository.MenuRepository
}

func NewModelService(modelRepo repository.ModelRepository, menuRepo repository.MenuRepository) ModelService {
	return &modelService{
		modelRepo: modelRepo,
		menuRepo:  menuRepo,
	}
}

func (s *modelService) SaveModel(ctx context.Context, model models.Model, isCreate bool) (*uuid.UUID, error) {
	if isCreate {
		return s.modelRepo.CreateModel(ctx, &model)
	}

	err := s.modelRepo.UpdateModel(ctx, &model)
	if err != nil {
		return nil, fmt.Errorf("failed to update model: %w", err)
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
	models, err := s.modelRepo.GetModels(ctx, clientID)
	if err != nil {
		return nil, fmt.Errorf("failed to get models: %w", err)
	}
	return models, nil
}

func (s *modelService) GetModelById(ctx context.Context, modelID uuid.UUID) (models.Model, error) {
	model, err := s.modelRepo.GetModelById(ctx, modelID)
	if err != nil {
		return models.Model{}, fmt.Errorf("failed to get model by id: %w", err)
	}
	return model, nil
}

func (s *modelService) DeleteModel(ctx context.Context, modelID uuid.UUID) error {
	// First, remove model references from menu items
	err := s.menuRepo.RemoveModelFromMenuItems(ctx, modelID)
	if err != nil {
		return fmt.Errorf("failed to remove model references from menu items: %w", err)
	}

	// Then delete the model itself
	err = s.modelRepo.DeleteModel(ctx, modelID)
	if err != nil {
		return fmt.Errorf("failed to delete model: %w", err)
	}

	return nil
}
