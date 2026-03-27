package main

import (
	"log"

	"blog-server/config"
	"blog-server/database"
	"blog-server/handlers"
	"blog-server/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if err := database.Init(&cfg.Database); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	r := gin.Default()
	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register(cfg))
			auth.POST("/login", handlers.Login(cfg))
		}

		authProtected := api.Group("/auth")
		authProtected.Use(middleware.Auth(cfg))
		{
			authProtected.GET("/me", handlers.GetCurrentUser())
		}

		comments := api.Group("/comments")
		{
			comments.GET("/:post_slug", handlers.GetComments())
		}

		commentsProtected := api.Group("/comments")
		commentsProtected.Use(middleware.Auth(cfg))
		{
			commentsProtected.POST("", handlers.CreateComment())
			commentsProtected.DELETE("/:id", handlers.DeleteComment())
		}

		admin := api.Group("/admin")
		admin.Use(middleware.Auth(cfg), middleware.AdminOnly())
		{
			admin.GET("/stats", handlers.GetStats())
			admin.GET("/comments", handlers.GetAdminComments())
			admin.PUT("/comments/:id/status", handlers.UpdateCommentStatus())
			admin.DELETE("/comments/:id", handlers.DeleteAdminComment())
			admin.POST("/comments/batch", handlers.BatchCommentAction())
		}

		adminSuper := api.Group("/admin")
		adminSuper.Use(middleware.Auth(cfg), middleware.SuperAdminOnly())
		{
			adminSuper.GET("/users", handlers.GetUsers())
			adminSuper.PUT("/users/:id/role", handlers.UpdateUserRole())
			adminSuper.PUT("/users/:id/status", handlers.UpdateUserStatus())
			adminSuper.DELETE("/users/:id", handlers.DeleteUser())
		}
	}

	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
