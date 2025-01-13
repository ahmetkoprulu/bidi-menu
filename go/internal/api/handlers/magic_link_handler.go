package handlers

import (
	"context"
	"net/http"

	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
)

type MagicLinkHandler struct {
	magicLinkService services.MagicLinkService
	authService      services.AuthService
	clientService    services.ClientService
}

func NewMagicLinkHandler(
	magicLinkService services.MagicLinkService,
	authService services.AuthService,
	clientService services.ClientService,
) *MagicLinkHandler {
	return &MagicLinkHandler{
		magicLinkService: magicLinkService,
		authService:      authService,
		clientService:    clientService,
	}
}

func (h *MagicLinkHandler) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/magic-link")
	{
		auth.GET("/validate", h.ValidateMagicLink)
	}
}

// @Summary Validate magic link
// @Description Validate a magic link token and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param token query string true "Magic link token"
// @Success 200 {object} LoginResponse
// @Failure 400 {object} ErrorResponse
// @Router /auth/magic-link/validate [get]
func (h *MagicLinkHandler) ValidateMagicLink(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "token is required"})
		return
	}

	magicLink, err := h.magicLinkService.ValidateMagicLink(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	client, err := h.clientService.GetClient(context.Background(), magicLink.ClientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	// Generate JWT token
	jwtToken, err := h.authService.GenerateToken(context.Background(), client)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:  jwtToken,
		Client: *client,
	})
}
