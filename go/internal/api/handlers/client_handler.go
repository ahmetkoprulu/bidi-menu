package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ClientHandler struct {
	clientService services.ClientService
}

// ClientStatusRequest represents the request body for updating client status
type ClientStatusRequest struct {
	Status models.ClientStatus `json:"status" binding:"required"`
}

// ClientLogoRequest represents the request body for updating client logo
type ClientLogoRequest struct {
	Logo string `json:"logo" binding:"required"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse[T any] struct {
	Data       []*T `json:"data"`
	TotalCount int  `json:"totalCount"`
	Page       int  `json:"page"`
	PageSize   int  `json:"pageSize"`
}

func NewClientHandler(clientService services.ClientService) *ClientHandler {
	return &ClientHandler{
		clientService: clientService,
	}
}

// RegisterRoutes registers all routes for client operations
func (h *ClientHandler) RegisterRoutes(router *gin.RouterGroup) {
	clients := router.Group("/clients")
	{
		clients.GET("", h.GetClients)
		clients.GET("/search", h.SearchClients)
		clients.GET("/:id", h.GetClient)
		clients.PUT("/:id", h.UpdateClient)
		clients.PUT("/:id/status", h.UpdateClientStatus)
		clients.PUT("/:id/logo", h.UpdateClientLogo)
		clients.POST("/init", h.InitClient)
	}
}

// @Summary Get a client by ID
// @Description Get detailed information about a specific client
// @Tags clients
// @Accept json
// @Produce json
// @Param id path string true "Client ID"
// @Success 200 {object} models.Client
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /clients/{id} [get]
// @Security Bearer
func (h *ClientHandler) GetClient(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid client ID"})
		return
	}

	client, err := h.clientService.GetClient(c.Request.Context(), clientID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, client)
}

func (h *ClientHandler) InitClient(c *gin.Context) {
	var model models.ClientInitRequest
	if err := c.ShouldBindJSON(&model); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	client, err := h.clientService.InitClient(context.Background(), &model)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, client)
}

// @Summary Update client information
// @Description Update the information of a specific client
// @Tags clients
// @Accept json
// @Produce json
// @Param id path string true "Client ID"
// @Param client body models.Client true "Client information"
// @Success 200 {object} models.Client
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /clients/{id} [put]
// @Security Bearer
func (h *ClientHandler) UpdateClient(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid client ID"})
		return
	}

	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	client.ID = clientID
	if err := h.clientService.UpdateClient(c.Request.Context(), &client); err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, client)
}

// @Summary Update client status
// @Description Update the status of a specific client
// @Tags clients
// @Accept json
// @Produce json
// @Param id path string true "Client ID"
// @Param status body ClientStatusRequest true "Client status"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /clients/{id}/status [put]
// @Security Bearer
func (h *ClientHandler) UpdateClientStatus(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid client ID"})
		return
	}

	var req ClientStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if err := h.clientService.UpdateClientStatus(c.Request.Context(), clientID, req.Status); err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "client status updated successfully"})
}

// @Summary Update client logo
// @Description Update the logo of a specific client
// @Tags clients
// @Accept json
// @Produce json
// @Param id path string true "Client ID"
// @Param logo body ClientLogoRequest true "Logo URL"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /clients/{id}/logo [put]
// @Security Bearer
func (h *ClientHandler) UpdateClientLogo(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid client ID"})
		return
	}

	var req ClientLogoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if err := h.clientService.UpdateClientLogo(c.Request.Context(), clientID, req.Logo); err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "client logo updated successfully"})
}

// @Summary Get all clients
// @Description Get a paginated list of all clients
// @Tags clients
// @Accept json
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10)"
// @Success 200 {object} PaginatedResponse[models.Client]
// @Failure 400 {object} ErrorResponse
// @Router /clients [get]
// @Security Bearer
func (h *ClientHandler) GetClients(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	clients, totalCount, err := h.clientService.GetClients(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, PaginatedResponse[models.Client]{
		Data:       clients,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	})
}

// @Summary Search clients
// @Description Search clients by name or email
// @Tags clients
// @Accept json
// @Produce json
// @Param query query string true "Search query"
// @Param page query int false "Page number (default: 1)"
// @Param pageSize query int false "Page size (default: 10)"
// @Success 200 {object} PaginatedResponse[models.Client]
// @Failure 400 {object} ErrorResponse
// @Router /clients/search [get]
// @Security Bearer
func (h *ClientHandler) SearchClients(c *gin.Context) {
	query := c.Query("query")
	if query == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "search query is required"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	clients, totalCount, err := h.clientService.SearchClients(c.Request.Context(), query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, PaginatedResponse[models.Client]{
		Data:       clients,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	})
}
