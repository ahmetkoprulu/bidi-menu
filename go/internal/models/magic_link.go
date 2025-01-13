package models

import (
	"time"

	"github.com/google/uuid"
)

type MagicLinkStatus string
type MagicLinkPurpose string

const (
	MagicLinkStatusPending MagicLinkStatus = "pending"
	MagicLinkStatusUsed    MagicLinkStatus = "used"
	MagicLinkStatusExpired MagicLinkStatus = "expired"
)

const (
	MagicLinkPurposeInit              MagicLinkPurpose = "init"
	MagicLinkPurposeLogin             MagicLinkPurpose = "login"
	MagicLinkPurposePasswordReset     MagicLinkPurpose = "password_reset"
	MagicLinkPurposeEmailVerification MagicLinkPurpose = "email_verification"
)

type MagicLink struct {
	ID        uuid.UUID        `json:"id" pg:"id"`
	ClientID  uuid.UUID        `json:"client_id" pg:"client_id"`
	Token     string           `json:"token" pg:"token"`
	Email     string           `json:"email" pg:"email"`
	Purpose   MagicLinkPurpose `json:"purpose" pg:"purpose"`
	ExpiresAt time.Time        `json:"expires_at" pg:"expires_at"`
	Status    MagicLinkStatus  `json:"status" pg:"status"`
	CreatedAt time.Time        `json:"created_at" pg:"created_at"`
	UpdatedAt time.Time        `json:"updated_at" pg:"updated_at"`
}

type CreateMagicLinkRequest struct {
	ClientID uuid.UUID        `json:"client_id" binding:"required"`
	Email    string           `json:"email" binding:"required,email"`
	Purpose  MagicLinkPurpose `json:"purpose" binding:"required,oneof=initlogin password_reset email_verification"`
}
