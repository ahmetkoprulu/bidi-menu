package impl

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/google/uuid"
)

type magicLinkService struct {
	magicLinkRepo repository.MagicLinkRepository
}

func NewMagicLinkService(magicLinkRepo repository.MagicLinkRepository) services.MagicLinkService {
	return &magicLinkService{
		magicLinkRepo: magicLinkRepo,
	}
}

func (s *magicLinkService) CreateMagicLink(ctx context.Context, req *models.CreateMagicLinkRequest) (*models.MagicLink, error) {
	// Generate token
	token, err := generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Create magic link
	magicLink := &models.MagicLink{
		ID:        uuid.New(),
		ClientID:  req.ClientID,
		Token:     token,
		Email:     req.Email,
		Purpose:   req.Purpose,
		ExpiresAt: time.Time{},
		Status:    models.MagicLinkStatusPending,
	}

	err = s.magicLinkRepo.Create(ctx, magicLink)
	if err != nil {
		return nil, fmt.Errorf("failed to create magic link: %w", err)
	}

	return magicLink, nil
}

func (s *magicLinkService) ValidateMagicLink(ctx context.Context, token string) (*models.MagicLink, error) {
	// Get magic link
	magicLink, err := s.magicLinkRepo.GetByToken(context.Background(), token)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired token")
	}

	// Check if expired
	if magicLink.Purpose != models.MagicLinkPurposeInit && time.Now().After(magicLink.ExpiresAt) {
		_ = s.magicLinkRepo.UpdateStatus(ctx, magicLink.ID, models.MagicLinkStatusExpired)
		return nil, fmt.Errorf("token expired")
	}

	// Check if already used
	if magicLink.Status != models.MagicLinkStatusPending {
		return nil, fmt.Errorf("token already used or expired")
	}

	return magicLink, nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
