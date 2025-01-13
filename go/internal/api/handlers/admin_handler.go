package handlers

import (
	"net/http"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	adminService  services.AdminService
	clientService services.ClientService
}

// LoginResponse represents the response for a successful login
type AdminLoginResponse struct {
	Token string `json:"token"`
}

func NewAdminHandler(adminService services.AdminService, clientService services.ClientService) *AdminHandler {
	return &AdminHandler{
		adminService:  adminService,
		clientService: clientService,
	}
}

// RegisterRoutes registers all routes for authentication
func (h *AdminHandler) RegisterRoutes(router *gin.RouterGroup) {
	admin := router.Group("/admin")
	{
		admin.POST("/login", h.Login)
		admin.GET("/clients", h.GetClients)
	}
}

// @Summary Login
// @Description Authenticate a client and return a JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login credentials"
// @Success 200 {object} LoginResponse
// @Failure 400 {object} ErrorResponse
// @Router /auth/login [post]
func (h *AdminHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	token, err := h.adminService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, AdminLoginResponse{
		Token: token,
	})
}

func (h *AdminHandler) GetClients(c *gin.Context) {
	clients, totalCount, err := h.clientService.GetClientsWithMenus(c.Request.Context(), 1, 10)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"clients":  clients,
		"total":    totalCount,
		"page":     1,
		"pageSize": 10,
	})
}
