package models

import (
	"time"

	"github.com/google/uuid"
)

type Client struct {
	ID           uuid.UUID    `json:"id" pg:"id"`
	Name         string       `json:"name" pg:"name"`
	Email        string       `json:"email" pg:"email"`
	Password     string       `json:"-" pg:"password"`
	Phone        string       `json:"phone,omitempty" pg:"phone"`
	Status       ClientStatus `json:"status" pg:"status"`
	TrialEndDate *time.Time   `json:"trialEndDate,omitempty" pg:"trial_end_date"`
	Address      *string      `json:"address,omitempty" pg:"address"`
	City         *string      `json:"city,omitempty" pg:"city"`
	Country      *string      `json:"country,omitempty" pg:"country"`
	Timezone     *string      `json:"timezone,omitempty" pg:"timezone"`
	Logo         *string      `json:"logo,omitempty" pg:"logo"`
	CreatedAt    time.Time    `json:"createdAt" pg:"created_at"`
	UpdatedAt    time.Time    `json:"updatedAt" pg:"updated_at"`
}

type RegisterRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	Phone       string `json:"phone" binding:"required"`
	CompanyName string `json:"companyName" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
