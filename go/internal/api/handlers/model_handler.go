package handlers

import (
	"context"
	"net/http"
	"slices"

	"github.com/ahmetkoprulu/bidi-menu/common/storage"
	"github.com/ahmetkoprulu/bidi-menu/internal/api/middleware"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ModelHandler struct {
	modelService   services.ModelService
	menuService    services.MenuService
	storageService storage.StorageService
}

func NewModelHandler(modelService services.ModelService, menuService services.MenuService, storageService storage.StorageService) *ModelHandler {
	return &ModelHandler{
		modelService:   modelService,
		menuService:    menuService,
		storageService: storageService,
	}
}

// RegisterRoutes registers all routes for menu operations
func (h *ModelHandler) RegisterRoutes(router *gin.RouterGroup) {
	model := router.Group("/model")
	{
		model.POST("", h.SaveModel)
		model.GET("", h.GetModel)
		model.GET("/list", h.GetModels)
		model.GET("/:id", h.GetModelById)
		model.DELETE("/:id", h.DeleteModel)
	}
}

func (h *ModelHandler) GetModelById(c *gin.Context) {
	id := c.Param("id")
	model, err := h.modelService.GetModelById(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, model)
}

func (h *ModelHandler) SaveModel(c *gin.Context) {
	clientID := c.MustGet(middleware.ClientIDKey).(uuid.UUID)
	roles := c.MustGet(middleware.UserRoleKey).([]string)

	// Get form data
	glbFile, err := c.FormFile("glb")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "GLB/GLTF file is required"})
		return
	}

	usdzFile, err := c.FormFile("usdz")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "USDZ file is required"})
		return
	}

	thumbnailFile, err := c.FormFile("thumbnail")
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "thumbnail file is required"})
		return
	}

	model := models.Model{
		Name:     c.PostForm("name"),
		ClientID: uuid.MustParse(c.PostForm("clientId")),
	}

	if err := c.ShouldBind(&model); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if !slices.Contains(roles, "admin") && clientID != model.ClientID {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "you are not authorized to create a model"})
		return
	}

	// Generate new UUID if not updating
	isCreate := model.ID == nil
	if isCreate {
		newID := uuid.New()
		model.ID = &newID
	}

	// Save GLB file
	glbPath, err := h.storageService.SaveGlbModel(glbFile, *model.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Failed to save GLB file: " + err.Error()})
		return
	}

	// Save USDZ file
	usdzPath, err := h.storageService.SaveUsdzModel(usdzFile, *model.ID)
	if err != nil {
		// Cleanup GLB file if USDZ upload fails
		h.storageService.DeleteGlbModel(*model.ID)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Failed to save USDZ file: " + err.Error()})
		return
	}

	// Save thumbnail
	thumbnailPath, err := h.storageService.SaveThumbnail(thumbnailFile, *model.ID)
	if err != nil {
		// Cleanup both model files if thumbnail upload fails
		h.storageService.DeleteGlbModel(*model.ID)
		h.storageService.DeleteUsdzModel(*model.ID)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Failed to save thumbnail: " + err.Error()})
		return
	}

	// Update model paths
	model.GlbFile = glbPath
	model.UsdzFile = usdzPath
	model.Thumbnail = thumbnailPath

	// Save to database
	modelID, err := h.modelService.SaveModel(context.Background(), model, isCreate)
	if err != nil {
		// Cleanup all files if database operation fails
		h.storageService.DeleteGlbModel(*model.ID)
		h.storageService.DeleteUsdzModel(*model.ID)
		h.storageService.DeleteThumbnail(*model.ID)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	model.ID = modelID
	c.JSON(http.StatusOK, model)
}

func (h *ModelHandler) GetModel(c *gin.Context) {
	clientID := c.MustGet(middleware.ClientIDKey).(uuid.UUID)
	model, err := h.modelService.GetModel(context.Background(), clientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model)
}

func (h *ModelHandler) GetModels(c *gin.Context) {
	clientID := c.Query("clientId")
	models, err := h.modelService.GetModels(context.Background(), uuid.MustParse(clientID))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models)
}

func (h *ModelHandler) DeleteModel(c *gin.Context) {
	clientID := c.MustGet(middleware.ClientIDKey).(uuid.UUID)
	roles := c.MustGet(middleware.UserRoleKey).([]string)
	id := c.Param("id")

	// Parse model ID
	modelID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid model ID"})
		return
	}

	// Get model to check ownership
	model, err := h.modelService.GetModelById(c.Request.Context(), modelID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Model not found"})
		return
	}

	// Check authorization
	if !slices.Contains(roles, "admin") && clientID != model.ClientID {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "You are not authorized to delete this model"})
		return
	}

	// Delete model files first
	if err := h.storageService.DeleteGlbModel(modelID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete GLB file"})
		return
	}
	if err := h.storageService.DeleteUsdzModel(modelID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete USDZ file"})
		return
	}
	if err := h.storageService.DeleteThumbnail(modelID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete thumbnail"})
		return
	}

	// Delete model from menu
	if err := h.menuService.RemoveModelFromMenuItems(context.Background(), modelID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete model from menu"})
		return
	}

	// Delete model from database
	if err := h.modelService.DeleteModel(c.Request.Context(), modelID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Failed to delete model"})
		return
	}

	c.Status(http.StatusNoContent)
}
