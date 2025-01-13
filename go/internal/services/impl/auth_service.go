package impl

import (
	"context"
	"fmt"
	"slices"

	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type authService struct {
	authRepo repository.AuthRepository
}

func NewAuthService(authRepo repository.AuthRepository) services.AuthService {
	return &authService{
		authRepo: authRepo,
	}
}

func (s *authService) Register(ctx context.Context, req *models.RegisterRequest) (*models.Client, error) {
	// Check if email already exists
	existingClient, err := s.authRepo.GetClientByEmail(ctx, req.Email)
	if err == nil && existingClient != nil {
		return nil, fmt.Errorf("email already registered")
	}

	// Register client
	client, err := s.authRepo.Register(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to register: %w", err)
	}

	return client, nil
}

func (s *authService) Login(ctx context.Context, email, password string) (*models.Client, string, error) {
	// Validate credentials
	client, err := s.authRepo.Login(ctx, email, password)
	if err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Generate JWT token
	token, err := utils.GenerateJWTTokenWithClaims(utils.Claims{
		UserID:   client.ID.String(),
		Name:     client.Name,
		Email:    client.Email,
		ClientID: client.ID.String(),
		Roles:    []string{"client"},
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return client, token, nil
}

func (s *authService) CompleteInit(ctx context.Context, token string, req *models.RegisterRequest) error {
	// Validate magic link
	err := s.authRepo.CompleteInit(ctx, token, req)
	if err != nil {
		return fmt.Errorf("invalid or expired token: %w", err)
	}

	return nil
}

func (s *authService) ValidateToken(ctx context.Context, token string) (*models.Client, *utils.Claims, error) {
	// Validate JWT token
	claims, err := utils.ValidateJwTTokenWithClaims(token)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid token: %w", err)
	}

	// Get client from database
	if !slices.Contains(claims.Roles, "admin") {
		client, err := s.authRepo.GetClientByEmail(ctx, claims.Email)
		if err != nil {
			return nil, nil, fmt.Errorf("client not found: %w", err)
		}

		return client, claims, nil
	}

	return &models.Client{ID: uuid.New()}, claims, nil
}

func (s *authService) ResetPassword(ctx context.Context, clientID uuid.UUID, currentPassword, newPassword string) error {
	// Get client to verify current password
	client, err := s.authRepo.GetClientByID(ctx, clientID)
	if err != nil {
		return fmt.Errorf("client not found: %w", err)
	}

	// Verify current password
	_, err = s.authRepo.Login(ctx, client.Email, currentPassword)
	if err != nil {
		return fmt.Errorf("invalid current password")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	err = s.authRepo.UpdatePassword(ctx, clientID, string(hashedPassword))
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

func (s *authService) GenerateToken(ctx context.Context, client *models.Client) (string, error) {
	// Generate JWT token
	token, err := utils.GenerateJWTTokenWithClaims(utils.Claims{
		UserID: client.ID.String(),
		Name:   client.Name,
		Email:  client.Email,
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token, nil
}
