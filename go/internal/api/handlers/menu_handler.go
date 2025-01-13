package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/ahmetkoprulu/bidi-menu/internal/api/middleware"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MenuHandler struct {
	menuService services.MenuService
}

// CreateCategoryRequest represents the request body for creating a category
type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

// UpdateCategoryOrderRequest represents the request body for updating category order
type UpdateCategoryOrderRequest struct {
	Order int `json:"order" binding:"required"`
}

// CreateMenuItemRequest represents the request body for creating a menu item
type CreateMenuItemRequest struct {
	CategoryID  uuid.UUID `json:"categoryId" binding:"required"`
	Name        string    `json:"name" binding:"required"`
	Description string    `json:"description"`
	Price       float64   `json:"price" binding:"required"`
}

// UpdateMenuItemRequest represents the request body for updating a menu item
type UpdateMenuItemRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required"`
}

// UpdateItemImagesRequest represents the request body for updating item images
type UpdateItemImagesRequest struct {
	Images []string `json:"images" binding:"required"`
}

// ReorderCategoriesRequest represents the request body for reordering categories
type ReorderCategoriesRequest struct {
	Categories []struct {
		ID    uuid.UUID `json:"id" binding:"required"`
		Order int       `json:"order" binding:"required"`
	} `json:"categories" binding:"required"`
}

// UpdateCategoryStatusRequest represents the request body for updating category status
type UpdateCategoryStatusRequest struct {
	Status models.MenuStatus `json:"status" binding:"required"`
}

// UpdateItemsStatusRequest represents the request body for updating items status
type UpdateItemsStatusRequest struct {
	ItemIDs []uuid.UUID       `json:"itemIds" binding:"required"`
	Status  models.MenuStatus `json:"status" binding:"required"`
}

// ScanMenuResponse represents the response for menu scanning
type ScanMenuResponse struct {
	Menu   *models.Menu `json:"menu"`
	Errors []string     `json:"errors,omitempty"`
}

func NewMenuHandler(menuService services.MenuService) *MenuHandler {
	return &MenuHandler{
		menuService: menuService,
	}
}

// RegisterRoutes registers all routes for menu operations
func (h *MenuHandler) RegisterRoutes(router *gin.RouterGroup, v1 *gin.RouterGroup) {
	v1.GET("/menu/:id", h.GetMenuById)

	menu := router.Group("/menu")
	{
		menu.POST("", h.CreateMenu)
		menu.POST("/scan", h.ScanMenu)
		menu.GET("", h.GetMenu)
		menu.DELETE("/:id", h.DeleteMenu)
	}
}

func (h *MenuHandler) DeleteMenu(c *gin.Context) {
	id := c.Param("id")
	err := h.menuService.DeleteMenu(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}
}

func (h *MenuHandler) GetMenuById(c *gin.Context) {
	id := c.Param("id")
	menu, err := h.menuService.GetMenuById(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func (h *MenuHandler) CreateMenu(c *gin.Context) {
	var model models.Menu
	if err := c.ShouldBindJSON(&model); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	clientID := c.MustGet(middleware.ClientIDKey).(uuid.UUID)
	roles := c.MustGet(middleware.UserRoleKey).([]string)

	if !slices.Contains(roles, "admin") && clientID != model.ClientID {
		c.JSON(http.StatusForbidden, ErrorResponse{Error: "you are not authorized to create a menu"})
		return
	}

	menuID, err := h.menuService.SaveMenu(context.Background(), model)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	model.ID = &menuID
	c.JSON(http.StatusOK, model)
}

// @Summary Get menu
// @Description Get the complete menu with categories and items
// @Tags menu
// @Accept json
// @Produce json
// @Success 200 {array} models.MenuCategory
// @Failure 400 {object} ErrorResponse
// @Router /menu [get]
// @Security Bearer
func (h *MenuHandler) GetMenu(c *gin.Context) {
	clientID := c.MustGet(middleware.UserIDKey).(uuid.UUID)
	menu, err := h.menuService.GetMenu(c.Request.Context(), clientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, menu)
}

// @Summary Scan menu images
// @Description Upload and scan menu images to extract menu items
// @Tags menu
// @Accept multipart/form-data
// @Produce json
// @Param images formData file true "Menu images to scan (multiple files allowed)"
// @Success 200 {object} ScanMenuResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/scan [post]
// @Security Bearer
func (h *MenuHandler) ScanMenu(c *gin.Context) {
	clientID := c.MustGet(middleware.UserIDKey).(uuid.UUID)

	// Get uploaded files
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "failed to parse form data"})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "no images uploaded"})
		return
	}

	// Validate file types
	var imagePaths []string
	var uploadErrors []string

	for _, file := range files {
		// Check file extension
		ext := filepath.Ext(file.Filename)
		if !isAllowedImageType(ext) {
			uploadErrors = append(uploadErrors,
				fmt.Sprintf("unsupported file type for %s: %s", file.Filename, ext))
			continue
		}

		// Save file temporarily
		tempPath := filepath.Join(os.TempDir(), uuid.New().String()+ext)
		if err := c.SaveUploadedFile(file, tempPath); err != nil {
			uploadErrors = append(uploadErrors,
				fmt.Sprintf("failed to save file %s: %v", file.Filename, err))
			continue
		}

		imagePaths = append(imagePaths, tempPath)
		// Defer cleanup of temporary files
		defer os.Remove(tempPath)
	}

	if len(imagePaths) == 0 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: "no valid images were uploaded: " + strings.Join(uploadErrors, "; "),
		})
		return
	}

	// Process the images
	menu, err := h.menuService.ScanMenu(c.Request.Context(), clientID, imagePaths)
	if err != nil {
		uploadErrors = append(uploadErrors, fmt.Sprintf("menu scanning failed: %v", err))
	}

	// Return response with any errors that occurred during processing
	c.JSON(http.StatusOK, ScanMenuResponse{
		Menu:   menu,
		Errors: uploadErrors,
	})
}

// isAllowedImageType checks if the file extension is allowed
func isAllowedImageType(ext string) bool {
	ext = strings.ToLower(ext)
	allowedTypes := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".pdf":  true,
	}
	return allowedTypes[ext]
}
