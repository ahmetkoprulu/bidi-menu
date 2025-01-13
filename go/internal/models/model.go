package models

import (
	"time"

	"github.com/google/uuid"
)

type Model struct {
	ID        *uuid.UUID `json:"id" pg:"id"`
	ClientID  uuid.UUID  `json:"clientId" pg:"client_id"`
	Name      string     `json:"name" pg:"name"`
	Thumbnail string     `json:"thumbnail" pg:"thumbnail"`
	GlbFile   string     `json:"glbFile" pg:"glb_file"`
	UsdzFile  string     `json:"usdzFile" pg:"usdz_file"`
	CreatedAt time.Time  `json:"createdAt" pg:"created_at"`
	UpdatedAt time.Time  `json:"updatedAt" pg:"updated_at"`
}
