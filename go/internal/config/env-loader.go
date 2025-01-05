package config

import (
	"os"

	"github.com/ahmetkoprulu/bidi-menu/internal/models"
	"github.com/joho/godotenv"
)

func LoadEnvironment() *models.Config {
	godotenv.Load()

	return &models.Config{
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		DatabaseName:  os.Getenv("DATABASE_NAME"),
		MqURL:         os.Getenv("MQ_URL"),
		CacheURL:      os.Getenv("CACHE_URL"),
		ElasticUrl:    os.Getenv("ELASTIC_URL"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
		ServiceName:   os.Getenv("SERVICE_NAME"),
		ServerPort:    os.Getenv("PORT"),
		TesseractPath: os.Getenv("TESSERACT_PATH"),
	}
}
