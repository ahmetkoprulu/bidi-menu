package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/google/uuid"
)

type clientRepository struct {
	db *data.PgDbContext
}

func NewClientRepository(db *data.PgDbContext) repository.ClientRepository {
	return &clientRepository{db: db}
}

func (r *clientRepository) GetClient(ctx context.Context, clientID uuid.UUID) (*models.Client, error) {
	var client models.Client

	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT id, name, email, phone, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		WHERE id = $1
	`, clientID), &client)

	if err != nil {
		return nil, fmt.Errorf("client not found: %w", err)
	}

	return &client, nil
}

func (r *clientRepository) UpdateClient(ctx context.Context, client *models.Client) error {
	result, err := r.db.Exec(ctx, `
		UPDATE clients
		SET name = $1, phone = $2, address = $3, city = $4,
			country = $5, timezone = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
	`, client.Name, client.Phone, client.Address, client.City,
		client.Country, client.Timezone, client.ID)

	if err != nil {
		return fmt.Errorf("failed to update client: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("client not found")
	}

	return nil
}

func (r *clientRepository) UpdateClientStatus(ctx context.Context, clientID uuid.UUID, status models.ClientStatus) error {
	result, err := r.db.Exec(ctx, `
		UPDATE clients
		SET status = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`, status, clientID)

	if err != nil {
		return fmt.Errorf("failed to update client status: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("client not found")
	}

	return nil
}

func (r *clientRepository) UpdateClientLogo(ctx context.Context, clientID uuid.UUID, logo string) error {
	result, err := r.db.Exec(ctx, `
		UPDATE clients
		SET logo = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`, logo, clientID)

	if err != nil {
		return fmt.Errorf("failed to update client logo: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("client not found")
	}

	return nil
}

func (r *clientRepository) GetClients(ctx context.Context, page, pageSize int) ([]*models.Client, int, error) {
	// Get total count
	var totalCount int
	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM clients
	`), &totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get total count: %w", err)
	}

	// Get paginated clients
	offset := (page - 1) * pageSize
	rows, err := r.db.Query(ctx, `
		SELECT id, name, email, phone, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get clients: %w", err)
	}
	defer rows.Close()

	var clients []*models.Client
	for rows.Next() {
		var client models.Client
		err := rows.Scan(
			&client.ID, &client.Name, &client.Email, &client.Phone,
			&client.Status, &client.TrialEndDate, &client.Address,
			&client.City, &client.Country, &client.Timezone,
			&client.Logo, &client.CreatedAt, &client.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan client: %w", err)
		}
		clients = append(clients, &client)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating clients: %w", err)
	}

	return clients, totalCount, nil
}

func (r *clientRepository) SearchClients(ctx context.Context, query string, page, pageSize int) ([]*models.Client, int, error) {
	// Get total count for search
	var totalCount int
	err := r.db.ScanRow(r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM clients
		WHERE name ILIKE $1 OR email ILIKE $1
	`, "%"+query+"%"), &totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get total count: %w", err)
	}

	// Get paginated search results
	offset := (page - 1) * pageSize
	rows, err := r.db.Query(ctx, `
		SELECT id, name, email, phone, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		WHERE name ILIKE $1 OR email ILIKE $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, "%"+query+"%", pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search clients: %w", err)
	}
	defer rows.Close()

	var clients []*models.Client
	for rows.Next() {
		var client models.Client
		err := rows.Scan(
			&client.ID, &client.Name, &client.Email, &client.Phone,
			&client.Status, &client.TrialEndDate, &client.Address,
			&client.City, &client.Country, &client.Timezone,
			&client.Logo, &client.CreatedAt, &client.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan client: %w", err)
		}
		clients = append(clients, &client)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating clients: %w", err)
	}

	return clients, totalCount, nil
}
