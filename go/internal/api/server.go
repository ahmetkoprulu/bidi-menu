package api

import (
	"context"
	"net/http"
	"time"

	"github.com/ahmetkoprulu/bidi-menu/common/data"
	// _ "github.com/ahmetkoprulu/bidi-menu/docs"
	"github.com/ahmetkoprulu/bidi-menu/internal/api/handlers"
	"github.com/ahmetkoprulu/bidi-menu/internal/api/middleware"
	"github.com/ahmetkoprulu/bidi-menu/internal/services"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Server struct {
	router        *gin.Engine
	httpServer    *http.Server
	authService   services.AuthService
	clientService services.ClientService
	menuService   services.MenuService
	db            *data.PgDbContext
}

func NewServer(
	authService services.AuthService,
	clientService services.ClientService,
	menuService services.MenuService,
	db *data.PgDbContext,
) *Server {
	server := &Server{
		router:        gin.Default(),
		authService:   authService,
		clientService: clientService,
		menuService:   menuService,
		db:            db,
	}

	// Global middleware
	server.router.Use(middleware.RequestLogger())
	server.router.Use(middleware.CORSMiddleware())
	server.router.Use(middleware.ErrorMiddleware())
	server.router.Use(middleware.RateLimit(100, 200)) // 100 requests per second with burst of 200

	// Reverse proxy middleware for frontend
	frontendURL := "http://localhost:3000"
	if gin.Mode() == gin.ReleaseMode {
		frontendURL = "http://localhost:3000" // Change this to your production frontend URL
	}
	server.router.Use(middleware.ReverseProxy(frontendURL))

	// Create handlers
	authHandler := handlers.NewAuthHandler(authService)
	clientHandler := handlers.NewClientHandler(clientService)
	menuHandler := handlers.NewMenuHandler(menuService)
	healthHandler := handlers.NewHealthHandler()

	// Auth middleware
	authMiddleware := middleware.AuthMiddleware(authService)

	// Health check endpoint (outside of API versioning)
	healthHandler.RegisterRoutes(server.router.Group(""))

	// API v1 routes
	v1 := server.router.Group("/api/v1")
	{
		// Public routes
		authHandler.RegisterRoutes(v1)

		// Protected routes
		protected := v1.Group("", authMiddleware)
		{
			clientHandler.RegisterRoutes(protected)
			menuHandler.RegisterRoutes(protected)
		}
	}

	// Swagger documentation
	server.router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return server
}

func (s *Server) Start(addr string) error {
	s.httpServer = &http.Server{
		Addr:         addr,
		Handler:      s.router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	return s.httpServer.ListenAndServe()
}

func (s *Server) Router() *gin.Engine {
	return s.router
}

func (s *Server) Shutdown(ctx context.Context) error {
	if s.httpServer != nil {
		return s.httpServer.Shutdown(ctx)
	}
	return nil
}
