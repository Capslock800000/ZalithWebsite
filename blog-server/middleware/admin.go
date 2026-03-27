package middleware

import (
	"blog-server/models"
	"blog-server/utils"

	"github.com/gin-gonic/gin"
)

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			utils.Unauthorized(c, "User not authenticated")
			c.Abort()
			return
		}

		userRole := role.(models.UserRole)
		if userRole != models.RoleAdmin && userRole != models.RoleModerator {
			utils.Forbidden(c, "Admin or moderator access required")
			c.Abort()
			return
		}

		c.Next()
	}
}

func SuperAdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			utils.Unauthorized(c, "User not authenticated")
			c.Abort()
			return
		}

		userRole := role.(models.UserRole)
		if userRole != models.RoleAdmin {
			utils.Forbidden(c, "Admin access required")
			c.Abort()
			return
		}

		c.Next()
	}
}
