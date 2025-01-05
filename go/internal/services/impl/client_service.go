package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/google/uuid"
)

type clientService struct {
	clientRepo repository.ClientRepository
}

func NewClientService(clientRepo repository.ClientRepository) services.ClientService {
	return &clientService{
		clientRepo: clientRepo,
	}
}

func (s *clientService) GetClient(ctx context.Context, clientID uuid.UUID) (*models.Client, error) {
	client, err := s.clientRepo.GetClient(ctx, clientID)
	if err != nil {
		return nil, fmt.Errorf("failed to get client: %w", err)
	}
	return client, nil
}

func (s *clientService) UpdateClient(ctx context.Context, client *models.Client) error {
	err := s.clientRepo.UpdateClient(ctx, client)
	if err != nil {
		return fmt.Errorf("failed to update client: %w", err)
	}
	return nil
}

func (s *clientService) UpdateClientStatus(ctx context.Context, clientID uuid.UUID, status models.ClientStatus) error {
	err := s.clientRepo.UpdateClientStatus(ctx, clientID, status)
	if err != nil {
		return fmt.Errorf("failed to update client status: %w", err)
	}
	return nil
}

func (s *clientService) UpdateClientLogo(ctx context.Context, clientID uuid.UUID, logo string) error {
	err := s.clientRepo.UpdateClientLogo(ctx, clientID, logo)
	if err != nil {
		return fmt.Errorf("failed to update client logo: %w", err)
	}
	return nil
}

func (s *clientService) GetClients(ctx context.Context, page, pageSize int) ([]*models.Client, int, error) {
	clients, totalCount, err := s.clientRepo.GetClients(ctx, page, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get clients: %w", err)
	}
	return clients, totalCount, nil
}

func (s *clientService) SearchClients(ctx context.Context, query string, page, pageSize int) ([]*models.Client, int, error) {
	clients, totalCount, err := s.clientRepo.SearchClients(ctx, query, page, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search clients: %w", err)
	}
	return clients, totalCount, nil
}
