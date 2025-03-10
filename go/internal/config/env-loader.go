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
		BaseUrl:       os.Getenv("BASE_URL"),
		EmailConfig: models.EmailConfig{
			SMTPHost:     os.Getenv("SMTP_HOST"),
			SMTPPort:     os.Getenv("SMTP_PORT"),
			SMTPUsername: os.Getenv("SMTP_USERNAME"),
			SMTPPassword: os.Getenv("SMTP_PASSWORD"),
			FromEmail:    os.Getenv("FROM_EMAIL"),
		},
		SpacesConfig: models.SpacesConfig{
			Region:          os.Getenv("SPACES_REGION"),
			Bucket:          os.Getenv("SPACES_BUCKET"),
			Endpoint:        os.Getenv("SPACES_ENDPOINT"),
			AccessKeyID:     os.Getenv("SPACES_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("SPACES_SECRET_ACCESS_KEY"),
			CDNDomain:       os.Getenv("SPACES_CDN_DOMAIN"),
		},
	}
}
