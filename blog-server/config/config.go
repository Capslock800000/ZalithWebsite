package config

import "os"

type Config struct {
	ServerPort string
	JWTSecret  string
	Database   DatabaseConfig
	SMTP       SMTPConfig
	FrontendURL string
}

type DatabaseConfig struct {
	Driver string
	DSN    string
}

type SMTPConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string
}

func Load() *Config {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		Database: DatabaseConfig{
			Driver: "sqlite",
			DSN:    getEnv("DATABASE_URL", "blog.db"),
		},
		SMTP: SMTPConfig{
			Host:     getEnv("SMTP_HOST", "smtp.qq.com"),
			Port:     getEnv("SMTP_PORT", "587"),
			User:     getEnv("SMTP_USER", ""),
			Password: getEnv("SMTP_PASSWORD", ""),
			From:     getEnv("SMTP_FROM", getEnv("SMTP_USER", "")),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
