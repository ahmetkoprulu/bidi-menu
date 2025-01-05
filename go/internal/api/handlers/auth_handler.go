package handlers

import (
	"net/http"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService services.AuthService
}

// LoginResponse represents the response for a successful login
type LoginResponse struct {
	Token  string        `json:"token"`
	Client models.Client `json:"client"`
}

// MessageResponse represents a simple message response
type MessageResponse struct {
	Message string `json:"message"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// RegisterRoutes registers all routes for authentication
func (h *AuthHandler) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.PUT("/password", h.ResetPassword)
	}
}

// @Summary Register new client
// @Description Register a new client with the provided information
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Registration details"
// @Success 201 {object} models.Client
// @Failure 400 {object} ErrorResponse
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	client, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, client)
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
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	client, token, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:  token,
		Client: *client,
	})
}

// PasswordResetRequest represents the request body for password reset
type PasswordResetRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

// @Summary Reset password
// @Description Reset a client's password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body PasswordResetRequest true "Password reset details"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /auth/password [put]
// @Security Bearer
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	clientID := c.MustGet("userID").(uuid.UUID)

	var req PasswordResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err := h.authService.ResetPassword(c.Request.Context(), clientID, req.CurrentPassword, req.NewPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "password reset successfully"})
}
