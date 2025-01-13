package services

import (
	"context"
)

type AdminService interface {
	Login(ctx context.Context, email, password string) (string, error)
}
