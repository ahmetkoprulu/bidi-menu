package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ahmetkoprulu/bidi-menu/common/cache"
	"github.com/ahmetkoprulu/bidi-menu/common/data"
	"github.com/ahmetkoprulu/bidi-menu/common/utils"
	"github.com/ahmetkoprulu/bidi-menu/internal/api"
	"github.com/ahmetkoprulu/bidi-menu/internal/config"
	repoImpl "github.com/ahmetkoprulu/bidi-menu/internal/repository/impl"
	serviceImpl "github.com/ahmetkoprulu/bidi-menu/internal/services/impl"
)

// @title           AR Menu API
// @version         1.0
// @description     API Server for AR Menu SaaS Platform

// @contact.name   API Support
// @contact.email  support@bidi-menu.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
	config := config.LoadEnvironment()
	fmt.Println(config)
	// utils.InitElasticLogger(config.ElasticUrl, config.ServiceName)
	utils.InitLogger()
	defer utils.Logger.Sync()

	utils.SetJWTSecret(config.JWTSecret)

	err := data.LoadPostgres(config.DatabaseURL, config.DatabaseName)
	if err != nil {
		log.Fatalf("Failed to load Postgres: %v\n", err)
	}

	db, err := data.NewPgDbContext()
	if err != nil {
		utils.Logger.Fatal("Failed to connect to database", utils.Logger.String("error", err.Error()))
	}
	defer db.Close()

	redis, err := cache.NewRedisCache(config.CacheURL, 0)
	if err != nil {
		utils.Logger.Fatal("Failed to connect to redis", utils.Logger.String("error", err.Error()))
	}
	defer redis.Close()

	// Initialize repositories
	authRepo := repoImpl.NewAuthRepository(db)
	clientRepo := repoImpl.NewClientRepository(db)
	menuRepo := repoImpl.NewMenuRepository(db)
	magicLinkRepo := repoImpl.NewMagicLinkRepository(db)
	modelRepo := repoImpl.NewModelRepository(db)

	// Initialize services
	emailService := serviceImpl.NewEmailService(config)
	magicLinkService := serviceImpl.NewMagicLinkService(magicLinkRepo)
	authService := serviceImpl.NewAuthService(authRepo)
	clientService := serviceImpl.NewClientService(clientRepo, emailService, magicLinkService)
	menuService := serviceImpl.NewMenuService(menuRepo)
	modelService := serviceImpl.NewModelService(modelRepo)
	adminService := serviceImpl.NewAdminService()

	// Create and configure server
	server := api.NewServer(
		authService,
		clientService,
		menuService,
		modelService,
		adminService,
		magicLinkService,
		db,
	)

	// Start server in a goroutine
	go func() {
		addr := fmt.Sprintf(":%s", os.Getenv("PORT"))
		if err := server.Start(addr); err != nil {
			utils.Logger.Fatal("Failed to start server", utils.Logger.String("error", err.Error()))
		}
	}()

	utils.Logger.Info("Server started successfully", utils.Logger.String("port", os.Getenv("PORT")))

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	utils.Logger.Info("Server is shutting down...")

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		utils.Logger.Fatal("Server forced to shutdown", utils.Logger.String("error", err.Error()))
	}

	utils.Logger.Info("Server exited gracefully")
}
