package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/google/uuid"
)

type modelRepository struct {
	db *data.PgDbContext
}

func NewModelRepository(db *data.PgDbContext) repository.ModelRepository {
	return &modelRepository{db: db}
}

func (r *modelRepository) CreateModel(ctx context.Context, model *models.Model) (*uuid.UUID, error) {
	query := `
		INSERT INTO models (id, client_id, name, thumbnail, glb_file, usdz_file)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	id := uuid.New()
	model.ID = &id
	err := r.db.QueryRow(ctx, query, model.ID, model.ClientID, model.Name, model.Thumbnail, model.GlbFile, model.UsdzFile).Scan(&model.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to create model: %w", err)
	}

	return model.ID, nil
}

func (r *modelRepository) UpdateModel(ctx context.Context, model *models.Model) error {
	query := `
		UPDATE models
		SET name = $2, thumbnail = $3, glb_file = $4, usdz_file = $5
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, model.ID, model.Name, model.Thumbnail, model.GlbFile, model.UsdzFile)
	if err != nil {
		return fmt.Errorf("failed to update model: %w", err)
	}

	return nil
}

func (r *modelRepository) GetModel(ctx context.Context, modelID uuid.UUID) (models.Model, error) {
	query := `
		SELECT id, client_id, name, thumbnail, glb_file, usdz_file
		FROM models
		WHERE id = $1
	`

	var model models.Model
	err := r.db.QueryRow(ctx, query, modelID).Scan(&model.ID, &model.ClientID, &model.Name, &model.Thumbnail, &model.GlbFile, &model.UsdzFile)
	if err != nil {
		return models.Model{}, fmt.Errorf("failed to get model: %w", err)
	}

	return model, nil
}

func (r *modelRepository) GetModels(ctx context.Context, clientID uuid.UUID) ([]models.Model, error) {
	var ms []models.Model
	query := `
		SELECT id, client_id, name, thumbnail, glb_file, usdz_file
		FROM models
		WHERE client_id = $1
	`

	rows, err := r.db.Query(ctx, query, clientID)
	if err != nil {
		return []models.Model{}, fmt.Errorf("failed to get models: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var model models.Model
		err := rows.Scan(&model.ID, &model.ClientID, &model.Name, &model.Thumbnail, &model.GlbFile, &model.UsdzFile)
		if err != nil {
			return []models.Model{}, fmt.Errorf("failed to scan model: %w", err)
		}
		ms = append(ms, model)
	}

	return ms, nil
}

func (r *modelRepository) DeleteModel(ctx context.Context, modelID uuid.UUID) error {
	query := `
		DELETE FROM models
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, modelID)
	if err != nil {
		return fmt.Errorf("failed to delete model: %w", err)
	}

	return nil
}

func (r *modelRepository) GetModelById(ctx context.Context, modelID uuid.UUID) (models.Model, error) {
	query := `
		SELECT id, client_id, name, thumbnail, glb_file, usdz_file
		FROM models
		WHERE id = $1
	`

	var model models.Model
	err := r.db.QueryRow(ctx, query, modelID).Scan(&model.ID, &model.ClientID, &model.Name, &model.Thumbnail, &model.GlbFile, &model.UsdzFile)
	if err != nil {
		return models.Model{}, fmt.Errorf("failed to get model: %w", err)
	}

	return model, nil
}
