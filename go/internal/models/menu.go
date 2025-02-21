package models

import (
	"github.com/google/uuid"
)

type Menu struct {
	ID             *uuid.UUID         `json:"id" pg:"id"`
	Label          string             `json:"label" pg:"label"`
	Description    string             `json:"description" pg:"description"`
	ClientID       uuid.UUID          `json:"clientID" pg:"client_id"`
	Status         string             `json:"status" pg:"status"`
	Categories     []*MenuCategory    `json:"categories,omitempty" pg:"categories"`
	Customization  *MenuCustomization `json:"customization,omitempty" pg:"customization"`
	QRCutomization *QRCutomization    `json:"qrCustomization,omitempty" pg:"qr_customization"`
	QRCode         string             `json:"qrCode,omitempty" pg:"qr_code"`
	CreatedAt      string             `json:"createdAt" pg:"created_at"`
	UpdatedAt      string             `json:"updatedAt" pg:"updated_at"`
}

type MenuCustomization struct {
	QRCode *QRCutomization `json:"qrCode,omitempty"`
}

type Colors struct {
	Primary     string `json:"primary"`
	Secondary   string `json:"secondary"`
	Text        string `json:"text"`
	Background  string `json:"background"`
	Price       string `json:"price"`
	Heading     string `json:"heading"`
	Description string `json:"description"`
	HeaderText  string `json:"headerText"`
}

type Font struct {
	Heading string `json:"heading"`
	Body    string `json:"body"`
	Spacing int    `json:"spacing"`
}

type QRCutomization struct {
	Size            int    `json:"size"`
	ErrorCorrection string `json:"errorCorrection"`
	LogoSize        int    `json:"logoSize"`
	LogoColor       string `json:"logoColor"`
	QRColor         string `json:"qrColor"`
	BackgroundColor string `json:"backgroundColor"`
}

type MenuCategory struct {
	ID        uuid.UUID           `json:"id"`
	Name      string              `json:"name"`
	MenuItems []*MenuCategoryItem `json:"menuItems,omitempty"`
}

type MenuCategoryItem struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Price       float64    `json:"price"`
	ModelID     *uuid.UUID `json:"modelId"`
	Model       *Model     `json:"modelInfo,omitempty"`
}
