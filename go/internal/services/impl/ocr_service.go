package impl

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	gosseract "github.com/otiai10/gosseract/v2"
)

type OCRService interface {
	ScanMenu(ctx context.Context, imagePaths []string) (*models.Menu, error)
}

type ocrService struct {
	logger *utils.Loggger
}

func NewOCRService() *ocrService {
	var logger = utils.Logger

	return &ocrService{logger: logger}
}

func (s *ocrService) ScanMenu(ctx context.Context, imagePaths []string) (*models.Menu, error) {
	var wg sync.WaitGroup
	errorChan := make(chan error, len(imagePaths))
	pageChan := make(chan string, len(imagePaths))

	for _, path := range imagePaths {
		wg.Add(1)
		go func(path string) {
			defer wg.Done()
			text, err := processImage(path)
			if err != nil {
				errorChan <- fmt.Errorf("error processing %s: %v", path, err)
				return
			}
			pageChan <- text
			fmt.Printf("Processed: %s\n", path)
		}(path)
	}

	// Wait for all goroutines to complete
	wg.Wait()

	var text string
	for page := range pageChan {
		text += page
	}

	// Process the text into structured data
	menuData := processMenuText(text)
	return &menuData, nil
}

func processImage(imagePath string) (string, error) {
	client := gosseract.NewClient()
	defer client.Close()

	if err := client.SetImage(imagePath); err != nil {
		return "", fmt.Errorf("failed to set image: %v", err)
	}

	// Configure Tesseract for line-by-line processing
	client.SetPageSegMode(gosseract.PSM_SINGLE_BLOCK)
	var text string

	// Process the image line by line
	err := client.ProcessPages(func(line string) bool {
		text += line
		return true
	})

	if err != nil {
		return "", fmt.Errorf("OCR processing failed: %v", err)
	}

	return text, nil
}

func extractPriceFromText(text string) (float64, error) {
	// Look for price patterns like $10.99 or 10.99
	re := regexp.MustCompile(`\$?(\d+\.?\d*)`)
	matches := re.FindStringSubmatch(text)
	if len(matches) > 1 {
		return strconv.ParseFloat(matches[1], 64)
	}
	return 0, fmt.Errorf("no price found")
}

func processMenuText(text string) models.Menu {
	lines := strings.Split(text, "\n")
	menu := models.Menu{Categories: make([]*models.MenuCategory, 0)}
	var currentCategory *models.MenuCategory

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Assume lines in all caps are categories
		if strings.ToUpper(line) == line && !strings.Contains(line, "$") {
			if currentCategory != nil {
				menu.Categories = append(menu.Categories, currentCategory)
			}
			currentCategory = &models.MenuCategory{
				Name:      line,
				MenuItems: make([]*models.MenuCategoryItem, 0),
			}
			continue
		}

		// Try to extract price from the line
		if currentCategory != nil {
			parts := strings.Split(line, "    ") // Multiple spaces as delimiter
			if len(parts) >= 2 {
				price, err := extractPriceFromText(parts[len(parts)-1])
				if err == nil {
					item := &models.MenuCategoryItem{
						Name:  strings.TrimSpace(parts[0]),
						Price: price,
					}
					currentCategory.MenuItems = append(currentCategory.MenuItems, item)
				}
			}
		}
	}

	// Add the last category if it exists
	if currentCategory != nil {
		menu.Categories = append(menu.Categories, currentCategory)
	}

	return menu
}
