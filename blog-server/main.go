package main

import (
	"log"
	"os"

	"blog-server/config"
	"blog-server/database"
	"blog-server/handlers"
	"blog-server/middleware"
	"blog-server/services/email"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("未找到 .env 文件，使用环境变量")
	}

	cfg := config.Load()

	if err := database.Init(&cfg.Database); err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}

	var emailSvc *email.Service
	if cfg.SMTP.User != "" && cfg.SMTP.Password != "" {
		emailSvc = email.NewService(cfg)
		log.Println("邮件服务已初始化")
	} else {
		log.Println("邮件服务未配置，跳过")
	}

	r := gin.Default()
	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register(cfg, emailSvc))
			auth.POST("/login", handlers.Login(cfg))
			auth.POST("/verify-email", handlers.VerifyEmail(cfg, emailSvc))
			auth.POST("/resend-verify", handlers.ResendVerifyEmail(cfg, emailSvc))
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

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = cfg.ServerPort
	}

	log.Printf("服务器启动于端口 %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
