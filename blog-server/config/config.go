package config

import "os"

type Config struct {
	ServerPort string
	JWTSecret  string
	Database   DatabaseConfig
}

type DatabaseConfig struct {
	Driver string
	DSN    string
}

func Load() *Config {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Database: DatabaseConfig{
			Driver: "sqlite",
			DSN:    getEnv("DATABASE_URL", "blog.db"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
