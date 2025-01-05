package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
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
func (h *MenuHandler) RegisterRoutes(router *gin.RouterGroup) {
	menu := router.Group("/menu")
	{
		menu.POST("/scan", h.ScanMenu)
		menu.GET("", h.GetMenu)
		menu.GET("/categories/:id", h.GetCategory)
		menu.POST("/categories", h.CreateCategory)
		menu.PUT("/categories/:id/order", h.UpdateCategoryOrder)
		menu.DELETE("/categories/:id", h.DeleteCategory)
		menu.POST("/items", h.CreateMenuItem)
		menu.PUT("/items/:id", h.UpdateMenuItem)
		menu.DELETE("/items/:id", h.DeleteMenuItem)
		menu.PUT("/items/:id/images", h.UpdateItemImages)
		menu.PUT("/categories/reorder", h.ReorderCategories)
		menu.PUT("/categories/:id/status", h.UpdateCategoryStatus)
		menu.PUT("/items/status", h.UpdateItemsStatus)
	}
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

// @Summary Get category
// @Description Get a specific category with its items
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} models.MenuCategory
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /menu/categories/{id} [get]
// @Security Bearer
func (h *MenuHandler) GetCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid category ID"})
		return
	}

	category, err := h.menuService.GetCategory(c.Request.Context(), categoryID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, category)
}

// @Summary Create category
// @Description Create a new menu category
// @Tags menu
// @Accept json
// @Produce json
// @Param category body CreateCategoryRequest true "Category name"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/categories [post]
// @Security Bearer
func (h *MenuHandler) CreateCategory(c *gin.Context) {
	clientID := c.MustGet(middleware.UserIDKey).(uuid.UUID)
	var req CreateCategoryRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err := h.menuService.CreateCategory(c.Request.Context(), clientID, req.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "category created successfully"})
}

// @Summary Update category order
// @Description Update the display order of a category
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Param order body UpdateCategoryOrderRequest true "New order"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/categories/{id}/order [put]
// @Security Bearer
func (h *MenuHandler) UpdateCategoryOrder(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid category ID"})
		return
	}

	var req UpdateCategoryOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err = h.menuService.UpdateCategoryOrder(c.Request.Context(), categoryID, req.Order)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "category order updated successfully"})
}

// @Summary Delete category
// @Description Delete a menu category
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/categories/{id} [delete]
// @Security Bearer
func (h *MenuHandler) DeleteCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid category ID"})
		return
	}

	err = h.menuService.DeleteCategory(c.Request.Context(), categoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "category deleted successfully"})
}

// @Summary Create menu item
// @Description Create a new menu item
// @Tags menu
// @Accept json
// @Produce json
// @Param item body CreateMenuItemRequest true "Menu item details"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/items [post]
// @Security Bearer
func (h *MenuHandler) CreateMenuItem(c *gin.Context) {
	clientID := c.MustGet(middleware.UserIDKey).(uuid.UUID)
	var req CreateMenuItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err := h.menuService.CreateMenuItem(c.Request.Context(), clientID, req.CategoryID,
		req.Name, req.Description, req.Price)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "menu item created successfully"})
}

// @Summary Update menu item
// @Description Update an existing menu item
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Param item body UpdateMenuItemRequest true "Menu item details"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/items/{id} [put]
// @Security Bearer
func (h *MenuHandler) UpdateMenuItem(c *gin.Context) {
	itemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid item ID"})
		return
	}

	var req UpdateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err = h.menuService.UpdateMenuItem(c.Request.Context(), itemID,
		req.Name, req.Description, req.Price)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "menu item updated successfully"})
}

// @Summary Delete menu item
// @Description Delete a menu item
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/items/{id} [delete]
// @Security Bearer
func (h *MenuHandler) DeleteMenuItem(c *gin.Context) {
	itemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid item ID"})
		return
	}

	err = h.menuService.DeleteMenuItem(c.Request.Context(), itemID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "menu item deleted successfully"})
}

// @Summary Update item images
// @Description Update the images of a menu item
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Param images body UpdateItemImagesRequest true "Image URLs"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/items/{id}/images [put]
// @Security Bearer
func (h *MenuHandler) UpdateItemImages(c *gin.Context) {
	itemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid item ID"})
		return
	}

	var req UpdateItemImagesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err = h.menuService.UpdateItemImages(c.Request.Context(), itemID, req.Images)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "item images updated successfully"})
}

// @Summary Reorder categories
// @Description Update the display order of multiple categories
// @Tags menu
// @Accept json
// @Produce json
// @Param categories body ReorderCategoriesRequest true "Category orders"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/categories/reorder [put]
// @Security Bearer
func (h *MenuHandler) ReorderCategories(c *gin.Context) {
	var req ReorderCategoriesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	categoryOrders := make(map[uuid.UUID]int)
	for _, category := range req.Categories {
		categoryOrders[category.ID] = category.Order
	}

	err := h.menuService.ReorderCategories(c.Request.Context(), categoryOrders)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "categories reordered successfully"})
}

// @Summary Update category status
// @Description Update the status of a category and its items
// @Tags menu
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Param status body UpdateCategoryStatusRequest true "Category status"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/categories/{id}/status [put]
// @Security Bearer
func (h *MenuHandler) UpdateCategoryStatus(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid category ID"})
		return
	}

	var req UpdateCategoryStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err = h.menuService.UpdateCategoryStatus(c.Request.Context(), categoryID, req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "category status updated successfully"})
}

// @Summary Update items status
// @Description Update the status of multiple menu items
// @Tags menu
// @Accept json
// @Produce json
// @Param request body UpdateItemsStatusRequest true "Items status"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Router /menu/items/status [put]
// @Security Bearer
func (h *MenuHandler) UpdateItemsStatus(c *gin.Context) {
	var req UpdateItemsStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	err := h.menuService.UpdateItemsStatus(c.Request.Context(), req.ItemIDs, req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, MessageResponse{Message: "items status updated successfully"})
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
