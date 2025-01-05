package models

import (
	"time"

	"github.com/google/uuid"
)

type Menu struct {
	ID                uuid.UUID          `json:"id" pg:"id"`
	ClientID          uuid.UUID          `json:"clientID" pg:"client_id"`
	Status            string             `json:"status" pg:"status"`
	Categories        []*MenuCategory    `json:"categories,omitempty" pg:"categories"`
	MenuCustomization *MenuCustomization `json:"customization,omitempty" pg:"menu_customization"`
	QRCutomization    *QRCutomization    `json:"qrCustomization,omitempty" pg:"qr_customization"`
	QRCode            string             `json:"qrCode,omitempty" pg:"qr_code"`
	CreatedAt         string             `json:"createdAt" pg:"created_at"`
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
	ClientID  uuid.UUID           `json:"clientID"`
	Name      string              `json:"name"`
	Image     string              `json:"image"`
	Status    MenuStatus          `json:"status"`
	MenuItems []*MenuCategoryItem `json:"menuItems,omitempty"`
	CreatedAt time.Time           `json:"createdAt"`
	UpdatedAt time.Time           `json:"updatedAt"`
}

type MenuCategoryItem struct {
	ItemID uuid.UUID `json:"itemId"`
	Price  float64   `json:"price"`
}

type MenuItem struct {
	ID          uuid.UUID  `json:"id"`
	ClientID    uuid.UUID  `json:"clientID"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Price       float64    `json:"price"`
	Images      []string   `json:"images"`
	Status      MenuStatus `json:"status"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
