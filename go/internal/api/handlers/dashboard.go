package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DashboardResponse struct {
	Stats struct {
		TotalMenus  int64 `json:"totalMenus"`
		ActiveMenus int64 `json:"activeMenus"`
		TotalViews  int64 `json:"totalViews"` // Will be implemented later
	} `json:"stats"`
	RecentMenus []RecentMenu `json:"recentMenus"`
}

type RecentMenu struct {
	ID        string    `json:"id"`
	Label     string    `json:"label"`
	UpdatedAt time.Time `json:"updatedAt"`
	Views     int64     `json:"views"` // Will be implemented later
}

type DashboardHandler struct {
	db *data.PgDbContext
}

func NewDashboardHandler(db *data.PgDbContext) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/dashboard", h.GetDashboardData)
}

func (h *DashboardHandler) GetDashboardData(c *gin.Context) {
	var response DashboardResponse

	// Get client ID from token
	clientID := c.MustGet("clientID").(uuid.UUID)

	// Get total menus count for the client
	err := h.db.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM menus WHERE client_id = $1",
		clientID).Scan(&response.Stats.TotalMenus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total menus count"})
		return
	}

	// Get active menus count for the client
	err = h.db.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM menus WHERE client_id = $1 ", // AND is_active = true
		clientID).Scan(&response.Stats.ActiveMenus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active menus count"})
		return
	}

	// Set total views to 0 for now
	response.Stats.TotalViews = 0

	// Get recent menus for the client
	rows, err := h.db.Query(context.Background(), `
		SELECT id, label, updated_at 
		FROM menus 
		WHERE client_id = $1
		ORDER BY updated_at DESC 
		LIMIT 5
	`, clientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get recent menus"})
		return
	}
	defer rows.Close()

	var recentMenus []RecentMenu
	for rows.Next() {
		var menu RecentMenu
		err := rows.Scan(&menu.ID, &menu.Label, &menu.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan recent menu"})
			return
		}
		menu.Views = 0 // Will be implemented later
		recentMenus = append(recentMenus, menu)
	}

	response.RecentMenus = recentMenus
	c.JSON(http.StatusOK, response)
}
