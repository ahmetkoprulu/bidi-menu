package impl

import (
	"context"
	"fmt"

	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/ahmetkoprulu/bidi-menu/internal/repository"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type menuService struct {
	ocrService OCRService
	menuRepo   repository.MenuRepository
	logger     *utils.Loggger
}

func NewMenuService(menuRepo repository.MenuRepository, logger *zap.Logger, tessdataPath string) services.MenuService {
	return &menuService{
		menuRepo:   menuRepo,
		logger:     utils.Logger,
		ocrService: NewOCRService(),
	}
}

func (s *menuService) ScanMenu(ctx context.Context, clientID uuid.UUID, imagePaths []string) (*models.Menu, error) {
	menu, err := s.ocrService.ScanMenu(ctx, imagePaths)
	if err != nil {
		return nil, fmt.Errorf("failed to scan menu: %w", err)
	}

	return menu, nil
}

func (s *menuService) GetMenu(ctx context.Context, clientID uuid.UUID) ([]*models.MenuCategory, error) {
	categories, err := s.menuRepo.GetMenuWithCategories(ctx, clientID)
	if err != nil {
		return nil, fmt.Errorf("failed to get menu: %w", err)
	}

	return categories, nil
}

func (s *menuService) GetCategory(ctx context.Context, categoryID uuid.UUID) (*models.MenuCategory, error) {
	category, err := s.menuRepo.GetCategoryWithItems(ctx, categoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return category, nil
}

func (s *menuService) CreateCategory(ctx context.Context, clientID uuid.UUID, name string) error {
	category := &models.MenuCategory{
		ID:       uuid.New(),
		ClientID: clientID,
		Name:     name,
		Status:   models.MenuStatusActive,
	}

	err := s.menuRepo.CreateCategory(ctx, category)
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	return nil
}

func (s *menuService) UpdateCategoryOrder(ctx context.Context, categoryID uuid.UUID, order int) error {
	err := s.menuRepo.UpdateCategoryOrder(ctx, categoryID, order)
	if err != nil {
		return fmt.Errorf("failed to update category order: %w", err)
	}

	return nil
}

func (s *menuService) DeleteCategory(ctx context.Context, categoryID uuid.UUID) error {
	err := s.menuRepo.DeleteCategory(ctx, categoryID)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}

func (s *menuService) CreateMenuItem(ctx context.Context, clientID, categoryID uuid.UUID, name, description string, price float64) error {
	item := &models.MenuItem{
		ID:          uuid.New(),
		Name:        name,
		Description: description,
		Price:       price,
		// Status:      models.MenuStatusActive,
	}

	err := s.menuRepo.CreateMenuItem(ctx, item)
	if err != nil {
		return fmt.Errorf("failed to create menu item: %w", err)
	}

	return nil
}

func (s *menuService) UpdateMenuItem(ctx context.Context, itemID uuid.UUID, name, description string, price float64) error {
	item := &models.MenuItem{
		ID:          itemID,
		Name:        name,
		Description: description,
		Price:       price,
	}

	err := s.menuRepo.UpdateMenuItem(ctx, item)
	if err != nil {
		return fmt.Errorf("failed to update menu item: %w", err)
	}

	return nil
}

func (s *menuService) DeleteMenuItem(ctx context.Context, itemID uuid.UUID) error {
	err := s.menuRepo.DeleteMenuItem(ctx, itemID)
	if err != nil {
		return fmt.Errorf("failed to delete menu item: %w", err)
	}

	return nil
}

func (s *menuService) UpdateItemImages(ctx context.Context, itemID uuid.UUID, images []string) error {
	err := s.menuRepo.UpdateItemImages(ctx, itemID, images)
	if err != nil {
		return fmt.Errorf("failed to update item images: %w", err)
	}

	return nil
}

func (s *menuService) ReorderCategories(ctx context.Context, categoryOrders map[uuid.UUID]int) error {
	err := s.menuRepo.ReorderCategories(ctx, categoryOrders)
	if err != nil {
		return fmt.Errorf("failed to reorder categories: %w", err)
	}

	return nil
}

func (s *menuService) UpdateCategoryStatus(ctx context.Context, categoryID uuid.UUID, status models.MenuStatus) error {
	err := s.menuRepo.UpdateCategoryStatus(ctx, categoryID, status)
	if err != nil {
		return fmt.Errorf("failed to update category status: %w", err)
	}

	return nil
}

func (s *menuService) UpdateItemsStatus(ctx context.Context, itemIDs []uuid.UUID, status models.MenuStatus) error {
	err := s.menuRepo.UpdateItemsStatus(ctx, itemIDs, status)
	if err != nil {
		return fmt.Errorf("failed to update items status: %w", err)
	}

	return nil
}
