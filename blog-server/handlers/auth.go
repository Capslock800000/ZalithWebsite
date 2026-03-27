package handlers

import (
	"blog-server/config"
	"blog-server/database"
	"blog-server/models"
	"blog-server/services/email"
	"blog-server/utils"
	"time"

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

type VerifyEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

type ResendVerifyRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type AuthResponse struct {
	User   models.User `json:"user"`
	Tokens TokenPair   `json:"tokens"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func Register(cfg *config.Config, emailSvc *email.Service) gin.HandlerFunc {
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
			Email:         req.Email,
			Username:      req.Username,
			PasswordHash:  string(hashedPassword),
			Role:          models.RoleUser,
			Status:        models.StatusActive,
			EmailVerified: false,
		}

		if err := database.DB.Create(&user).Error; err != nil {
			utils.InternalError(c, "Failed to create user")
			return
		}

		if emailSvc != nil && emailSvc.IsConfigured() {
			code := email.GenerateCode()
			exp := time.Now().Add(10 * time.Minute)
			user.VerifyCode = code
			user.VerifyCodeExp = &exp

			verifyLink := cfg.FrontendURL + "/verify-email?email=" + req.Email + "&code=" + code
			go emailSvc.SendVerifyEmail(req.Email, &email.VerifyEmailData{
				Username: req.Username,
				Code:     code,
				Link:     verifyLink,
			})
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

func VerifyEmail(cfg *config.Config, emailSvc *email.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req VerifyEmailRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var user models.User
		if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
			utils.NotFound(c, "User not found")
			return
		}

		if user.EmailVerified {
			utils.BadRequest(c, "Email already verified")
			return
		}

		if user.VerifyCode != req.Code || user.VerifyCodeExp == nil || time.Now().After(*user.VerifyCodeExp) {
			utils.BadRequest(c, "Invalid or expired verification code")
			return
		}

		user.EmailVerified = true
		user.VerifyCode = ""
		user.VerifyCodeExp = nil

		if err := database.DB.Save(&user).Error; err != nil {
			utils.InternalError(c, "Failed to verify email")
			return
		}

		if emailSvc != nil && emailSvc.IsConfigured() {
			go emailSvc.SendWelcome(user.Email, &email.WelcomeData{
				Username: user.Username,
			})
		}

		utils.Success(c, gin.H{
			"message": "Email verified successfully",
			"user":    user,
		})
	}
}

func ResendVerifyEmail(cfg *config.Config, emailSvc *email.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ResendVerifyRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var user models.User
		if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
			utils.NotFound(c, "User not found")
			return
		}

		if user.EmailVerified {
			utils.BadRequest(c, "Email already verified")
			return
		}

		if emailSvc == nil || !emailSvc.IsConfigured() {
			utils.BadRequest(c, "Email service not configured")
			return
		}

		code := email.GenerateCode()
		exp := time.Now().Add(10 * time.Minute)
		user.VerifyCode = code
		user.VerifyCodeExp = &exp

		database.DB.Save(&user)

		verifyLink := cfg.FrontendURL + "/verify-email?email=" + req.Email + "&code=" + code
		if err := emailSvc.SendVerifyEmail(req.Email, &email.VerifyEmailData{
			Username: user.Username,
			Code:     code,
			Link:     verifyLink,
		}); err != nil {
			utils.InternalError(c, "Failed to send verification email")
			return
		}

		utils.Success(c, gin.H{
			"message": "Verification email sent",
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
