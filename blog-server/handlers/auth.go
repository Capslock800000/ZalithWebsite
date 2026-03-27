package handlers

import (
	"blog-server/config"
	"blog-server/database"
	"blog-server/models"
	"blog-server/utils"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User   models.User `json:"user"`
	Tokens TokenPair   `json:"tokens"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func Register(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var existingUser models.User
		if database.DB.Where("email = ?", req.Email).First(&existingUser).Error == nil {
			utils.BadRequest(c, "Email already registered")
			return
		}

		if database.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil {
			utils.BadRequest(c, "Username already taken")
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.InternalError(c, "Failed to hash password")
			return
		}

		user := models.User{
			Email:        req.Email,
			Username:     req.Username,
			PasswordHash: string(hashedPassword),
			Role:         models.RoleUser,
			Status:       models.StatusActive,
		}

		if err := database.DB.Create(&user).Error; err != nil {
			utils.InternalError(c, "Failed to create user")
			return
		}

		accessToken, _ := utils.GenerateAccessToken(&user, cfg)
		refreshToken, _ := utils.GenerateRefreshToken(&user, cfg)

		utils.Created(c, AuthResponse{
			User: user,
			Tokens: TokenPair{
				AccessToken:  accessToken,
				RefreshToken: refreshToken,
			},
		})
	}
}

func Login(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var user models.User
		if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
			utils.Unauthorized(c, "Invalid email or password")
			return
		}

		if user.Status == models.StatusDisabled {
			utils.Forbidden(c, "Account is disabled")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			utils.Unauthorized(c, "Invalid email or password")
			return
		}

		accessToken, _ := utils.GenerateAccessToken(&user, cfg)
		refreshToken, _ := utils.GenerateRefreshToken(&user, cfg)

		utils.Success(c, AuthResponse{
			User: user,
			Tokens: TokenPair{
				AccessToken:  accessToken,
				RefreshToken: refreshToken,
			},
		})
	}
}

func GetCurrentUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("userId")

		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			utils.NotFound(c, "User not found")
			return
		}

		utils.Success(c, gin.H{"user": user})
	}
}
