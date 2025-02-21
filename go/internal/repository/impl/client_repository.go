package impl

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

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

func (r *clientRepository) InitClient(ctx context.Context, model *models.ClientInitRequest) (models.Client, error) {
	var client models.Client
	clientID := uuid.New()

	err := r.db.QueryRow(ctx, `
		INSERT INTO clients (
			id, name, email, phone, company_name, status, trial_end_date,
			created_at, updated_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
		)
		RETURNING id, name, email, phone, company_name, status, trial_end_date,
			address, city, country, timezone, logo, created_at, updated_at
	`,
		clientID, model.Name, model.Email, model.Phone, model.CompanyName,
		models.ClientStatusTrial, time.Now().AddDate(0, 0, 14), // 14 days trial
	).Scan(
		&client.ID, &client.Name, &client.Email, &client.Phone, &client.CompanyName,
		&client.Status, &client.TrialEndDate, &client.Address, &client.City,
		&client.Country, &client.Timezone, &client.Logo, &client.CreatedAt, &client.UpdatedAt,
	)

	if err != nil {
		return models.Client{}, fmt.Errorf("failed to init client: %w", err)
	}

	return client, nil
}

func (r *clientRepository) GetClient(ctx context.Context, clientID uuid.UUID) (*models.Client, error) {
	var client models.Client
	err := r.db.QueryRow(ctx, `
		SELECT id, name, email, phone, status, trial_end_date, company_name,
			address, city, country, timezone, logo, created_at, updated_at
		FROM clients
		WHERE id = $1
	`, clientID).Scan(
		&client.ID, &client.Name, &client.Email, &client.Phone, &client.Status,
		&client.TrialEndDate, &client.CompanyName, &client.Address, &client.City,
		&client.Country, &client.Timezone, &client.Logo, &client.CreatedAt, &client.UpdatedAt,
	)

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

func (r *clientRepository) GetClientsWithMenus(ctx context.Context, page, pageSize int) ([]*models.Client, int, error) {
	// Get total count
	var totalCount int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT c.id) FROM clients c
		LEFT JOIN menus m ON c.id = m.client_id
	`).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get total count: %w", err)
	}

	// Get paginated clients with menus
	offset := (page - 1) * pageSize
	rows, err := r.db.Query(ctx, `
		SELECT 
			c.id, c.name, c.email, c.phone, c.status, c.trial_end_date,
			c.address, c.city, c.country, c.timezone, c.logo, c.created_at, c.updated_at,
			m.id, m.label, m.description, m.status, m.qr_code, m.created_at, m.categories, m.customization
		FROM clients c
		LEFT JOIN menus m ON c.id = m.client_id
		ORDER BY c.created_at DESC
		LIMIT $1 OFFSET $2
	`, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get clients with menus: %w", err)
	}
	defer rows.Close()

	clientMap := make(map[uuid.UUID]*models.Client)
	var clients []*models.Client

	for rows.Next() {
		var client models.Client
		var menuID, menuLabel, menuDesc, menuStatus, menuQR sql.NullString
		var menuCreatedAt sql.NullTime
		var trialEndDate sql.NullTime
		var address, city, country, timezone, logo sql.NullString
		var createdAt, updatedAt time.Time
		var menuCategories sql.NullString
		var menuCustomization sql.NullString
		err := rows.Scan(
			&client.ID, &client.Name, &client.Email, &client.Phone,
			&client.Status, &trialEndDate, &address, &city, &country,
			&timezone, &logo, &createdAt, &updatedAt,
			&menuID, &menuLabel, &menuDesc, &menuStatus, &menuQR, &menuCreatedAt, &menuCategories, &menuCustomization,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan client with menu: %w", err)
		}

		// Set nullable fields
		if trialEndDate.Valid {
			client.TrialEndDate = &trialEndDate.Time
		}
		if address.Valid {
			client.Address = &address.String
		}
		if city.Valid {
			client.City = &city.String
		}
		if country.Valid {
			client.Country = &country.String
		}
		if timezone.Valid {
			client.Timezone = &timezone.String
		}
		if logo.Valid {
			client.Logo = &logo.String
		}
		client.CreatedAt = createdAt
		client.UpdatedAt = updatedAt

		// Check if we've already processed this client
		existingClient, exists := clientMap[client.ID]
		if !exists {
			clientMap[client.ID] = &client
			clients = append(clients, &client)
			existingClient = &client
			existingClient.Menus = make([]*models.Menu, 0)
		}
		var categories []*models.MenuCategory
		if menuCategories.Valid {
			json.Unmarshal([]byte(menuCategories.String), &categories)
		}
		var customization *models.MenuCustomization
		if menuCustomization.Valid {
			json.Unmarshal([]byte(menuCustomization.String), &customization)
		}
		// Add menu if it exists
		if menuID.Valid {
			menuID := uuid.MustParse(menuID.String)
			menu := &models.Menu{
				ID:            &menuID,
				Label:         menuLabel.String,
				Description:   menuDesc.String,
				Status:        menuStatus.String,
				QRCode:        menuQR.String,
				CreatedAt:     menuCreatedAt.Time.Format(time.RFC3339),
				Categories:    categories,
				ClientID:      client.ID,
				Customization: customization,
			}
			existingClient.Menus = append(existingClient.Menus, menu)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating clients with menus: %w", err)
	}

	if clients == nil {
		clients = make([]*models.Client, 0)
	}

	return clients, totalCount, nil
}
