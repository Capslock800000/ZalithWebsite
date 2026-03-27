package database

import (
	"blog-server/config"
	"blog-server/models"
	"log"

	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
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

	if err := createDefaultAdmin(); err != nil {
		log.Printf("创建默认管理员失败: %v", err)
	}

	return nil
}

func createDefaultAdmin() error {
	var admin models.User
	result := DB.Where("email = ?", "3436464181@qq.com").First(&admin)
	
	if result.Error == nil {
		if admin.Role != models.RoleAdmin {
			admin.Role = models.RoleAdmin
			admin.Status = models.StatusActive
			admin.EmailVerified = true
			if err := DB.Save(&admin).Error; err != nil {
				return err
			}
			log.Println("已将用户 3436464181@qq.com 升级为管理员")
		}
		return nil
	}

	var count int64
	DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123456"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin = models.User{
		Email:         "3436464181@qq.com",
		Username:      "admin",
		PasswordHash:  string(hashedPassword),
		Role:          models.RoleAdmin,
		Status:        models.StatusActive,
		EmailVerified: true,
	}

	if err := DB.Create(&admin).Error; err != nil {
		return err
	}

	log.Println("默认管理员账户已创建: 3436464181@qq.com")
	return nil
}
