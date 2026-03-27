package database

import (
	"blog-server/config"
	"blog-server/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.DatabaseConfig) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(cfg.DSN), &gorm.Config{})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(&models.User{}, &models.Comment{})
	if err != nil {
		return err
	}

	return nil
}
