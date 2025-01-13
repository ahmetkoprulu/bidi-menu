package impl

import (
	"context"
	"fmt"
	"time"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type authRepository struct {
	db *data.PgDbContext
}

func NewAuthRepository(db *data.PgDbContext) repository.AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) Register(ctx context.Context, req *models.RegisterRequest) (*models.Client, error) {
	var client *models.Client

	err := r.db.WithTransaction(ctx, func(tx data.QueryRunner) error {
		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}

		// Create client
		client = &models.Client{
			ID:           uuid.New(),
			Name:         req.CompanyName,
			Email:        req.Email,
			Password:     string(hashedPassword),
			Phone:        req.Phone,
			Status:       models.ClientStatusTrial,
			TrialEndDate: utils.PtrTo(time.Now().AddDate(0, 0, 14)), // 14 days trial
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO clients (
				id, name, email, password, phone, status, trial_end_date,
				created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
			)
		`, client.ID, client.Name, client.Email, client.Password, client.Phone,
			client.Status, client.TrialEndDate)
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return client, nil
}

func (r *authRepository) Login(ctx context.Context, email, password string) (*models.Client, error) {
	var client models.Client

	err := r.db.QueryRow(ctx, `
		SELECT id, name, email, password, phone, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		WHERE email = $1
	`, email).Scan(&client.ID, &client.Name, &client.Email, &client.Password, &client.Phone, &client.Status, &client.TrialEndDate,
		&client.Address, &client.City, &client.Country, &client.Timezone, &client.Logo, &client.CreatedAt, &client.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("client not found: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(client.Password), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	return &client, nil
}

func (r *authRepository) GetClientByEmail(ctx context.Context, email string) (*models.Client, error) {
	var client models.Client

	err := r.db.QueryRow(ctx, `
		SELECT id, name, email, password, phone, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		WHERE email = $1
	`, email).Scan(&client.ID, &client.Name, &client.Email, &client.Password, &client.Phone, &client.Status, &client.TrialEndDate,
		&client.Address, &client.City, &client.Country, &client.Timezone, &client.Logo, &client.CreatedAt, &client.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("client not found: %w", err)
	}

	return &client, nil
}

func (r *authRepository) CompleteInit(ctx context.Context, token string, req *models.RegisterRequest) error {
	var magicLink models.MagicLink
	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT id, client_id, token, email, purpose, expires_at, status, created_at, updated_at
		FROM magic_links
		WHERE token = $1
	`, token), &magicLink)
	if err != nil {
		return fmt.Errorf("magic link not found: %w", err)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	_, err = r.db.Exec(ctx, `
		UPDATE clients SET name = $1, email = $2, password = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
	`, req.CompanyName, req.Email, string(hashedPassword), magicLink.ClientID)
	if err != nil {
		return fmt.Errorf("failed to complete init: %w", err)
	}

	_, err = r.db.Exec(ctx, `
		UPDATE magic_links SET status = 'used', updated_at = CURRENT_TIMESTAMP
		WHERE token = $1
	`, token)
	if err != nil {
		return fmt.Errorf("failed to complete init: %w", err)
	}

	return nil
}

func (r *authRepository) GetClientByID(ctx context.Context, clientID uuid.UUID) (*models.Client, error) {
	var client models.Client

	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT id, name, email, password, phone, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		WHERE id = $1
	`, clientID), &client)

	if err != nil {
		return nil, fmt.Errorf("client not found: %w", err)
	}

	return &client, nil
}

func (r *authRepository) UpdatePassword(ctx context.Context, clientID uuid.UUID, hashedPassword string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE clients SET password = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`, hashedPassword, clientID)

	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}
