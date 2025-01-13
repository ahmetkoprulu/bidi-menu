package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
)

type adminService struct {
}

func NewAdminService() services.AdminService {
	return &adminService{}
}

func (s *adminService) Login(ctx context.Context, email, password string) (string, error) {
	if email != "admin@bidi.com" || password != "admin" {
		return "", fmt.Errorf("invalid credentials")
	}

	token, err := utils.GenerateJWTTokenWithClaims(utils.Claims{
		UserID:   "admin",
		Name:     "admin",
		ClientID: "admin",
		Email:    email,
		Roles:    []string{"admin"},
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token, nil
}
