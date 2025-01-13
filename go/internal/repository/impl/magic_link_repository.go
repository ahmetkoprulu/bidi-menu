package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/google/uuid"
)

type magicLinkRepository struct {
	db *data.PgDbContext
}

func NewMagicLinkRepository(db *data.PgDbContext) repository.MagicLinkRepository {
	return &magicLinkRepository{
		db: db,
	}
}

func (r *magicLinkRepository) Create(ctx context.Context, magicLink *models.MagicLink) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO magic_links (
			id, client_id, token, email, purpose, expires_at, status,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
		)
	`, magicLink.ID, magicLink.ClientID, magicLink.Token, magicLink.Email, magicLink.Purpose,
		magicLink.ExpiresAt, magicLink.Status)

	if err != nil {
		return fmt.Errorf("failed to create magic link: %w", err)
	}

	return nil
}

func (r *magicLinkRepository) GetByToken(ctx context.Context, token string) (*models.MagicLink, error) {
	var magicLink models.MagicLink

	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT id, client_id, token, email, purpose, expires_at, status,
			created_at, updated_at
		FROM magic_links
		WHERE token = $1
	`, token), &magicLink)

	if err != nil {
		return nil, fmt.Errorf("failed to get magic link: %w", err)
	}

	return &magicLink, nil
}

func (r *magicLinkRepository) GetByEmail(ctx context.Context, email string) (*models.MagicLink, error) {
	var magicLink models.MagicLink

	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT id, client_id, token, email, purpose, expires_at, status,
			created_at, updated_at
		FROM magic_links
		WHERE email = $1 AND status = 'pending'
		ORDER BY created_at DESC
		LIMIT 1
	`, email), &magicLink)

	if err != nil {
		return nil, fmt.Errorf("failed to get magic link: %w", err)
	}

	return &magicLink, nil
}

func (r *magicLinkRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status models.MagicLinkStatus) error {
	_, err := r.db.Exec(ctx, `
		UPDATE magic_links
		SET status = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`, status, id)

	if err != nil {
		return fmt.Errorf("failed to update magic link status: %w", err)
	}

	return nil
}

func (r *magicLinkRepository) DeleteExpired(ctx context.Context) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM magic_links
		WHERE expires_at < CURRENT_TIMESTAMP
		OR status = 'used'
	`)

	if err != nil {
		return fmt.Errorf("failed to delete expired magic links: %w", err)
	}

	return nil
}
