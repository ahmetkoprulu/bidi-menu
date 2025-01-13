package models

import (
	"github.com/google/uuid"
)

type Menu struct {
	ID                *uuid.UUID         `json:"id" pg:"id"`
	Label             string             `json:"label" pg:"label"`
	Description       string             `json:"description" pg:"description"`
	ClientID          uuid.UUID          `json:"clientID" pg:"client_id"`
	Status            string             `json:"status" pg:"status"`
	Categories        []*MenuCategory    `json:"categories,omitempty" pg:"categories"`
	MenuCustomization *MenuCustomization `json:"customization,omitempty" pg:"menu_customization"`
	QRCutomization    *QRCutomization    `json:"qrCustomization,omitempty" pg:"qr_customization"`
	QRCode            string             `json:"qrCode,omitempty" pg:"qr_code"`
	CreatedAt         string             `json:"createdAt" pg:"created_at"`
	UpdatedAt         string             `json:"updatedAt" pg:"updated_at"`
}

type MenuCustomization struct {
	Colors    Colors `json:"colors"`
	Font      Font   `json:"font"`
	ItemStyle string `json:"itemStyle"`
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
	PrimaryColor    string `json:"primaryColor"`
	BackgroundColor string `json:"backgroundColor"`
	Size            int    `json:"size"`
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
