package handlers

import (
	"blog-server/database"
	"blog-server/models"
	"blog-server/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UpdateUserRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=user moderator admin"`
}

type UpdateUserStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=active disabled"`
}

type BatchActionRequest struct {
	IDs    []uint `json:"ids" binding:"required"`
	Action string `json:"action" binding:"required,oneof=approve reject delete"`
}

func GetStats() gin.HandlerFunc {
	return func(c *gin.Context) {
		var totalUsers int64
		var totalComments, pendingComments, approvedComments, rejectedComments int64

		database.DB.Model(&models.User{}).Count(&totalUsers)
		database.DB.Model(&models.Comment{}).Count(&totalComments)
		database.DB.Model(&models.Comment{}).Where("status = ?", models.CommentPending).Count(&pendingComments)
		database.DB.Model(&models.Comment{}).Where("status = ?", models.CommentApproved).Count(&approvedComments)
		database.DB.Model(&models.Comment{}).Where("status = ?", models.CommentRejected).Count(&rejectedComments)

		utils.Success(c, gin.H{
			"totalUsers":        totalUsers,
			"totalComments":     totalComments,
			"pendingComments":   pendingComments,
			"approvedComments":  approvedComments,
			"rejectedComments":  rejectedComments,
		})
	}
}

func GetUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
		search := c.Query("search")

		offset := (page - 1) * pageSize

		var users []models.User
		var total int64

		query := database.DB.Model(&models.User{})
		if search != "" {
			query = query.Where("username LIKE ? OR email LIKE ?", "%"+search+"%", "%"+search+"%")
		}

		query.Count(&total)
		query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users)

		utils.Success(c, gin.H{
			"users":    users,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		})
	}
}

func UpdateUserRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("id")

		var req UpdateUserRoleRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			utils.NotFound(c, "User not found")
			return
		}

		user.Role = models.UserRole(req.Role)
		if err := database.DB.Save(&user).Error; err != nil {
			utils.InternalError(c, "Failed to update user role")
			return
		}

		utils.Success(c, gin.H{"user": user})
	}
}

func UpdateUserStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("id")

		var req UpdateUserStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			utils.NotFound(c, "User not found")
			return
		}

		user.Status = models.UserStatus(req.Status)
		if err := database.DB.Save(&user).Error; err != nil {
			utils.InternalError(c, "Failed to update user status")
			return
		}

		utils.Success(c, gin.H{"user": user})
	}
}

func DeleteUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("id")

		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			utils.NotFound(c, "User not found")
			return
		}

		database.DB.Where("user_id = ?", user.ID).Delete(&models.Comment{})
		
		if err := database.DB.Delete(&user).Error; err != nil {
			utils.InternalError(c, "Failed to delete user")
			return
		}

		utils.Success(c, gin.H{"message": "User deleted"})
	}
}

func GetAdminComments() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
		status := c.Query("status")
		search := c.Query("search")

		offset := (page - 1) * pageSize

		var comments []models.Comment
		var total int64

		query := database.DB.Model(&models.Comment{}).Preload("User")
		if status != "" {
			query = query.Where("status = ?", status)
		}
		if search != "" {
			query = query.Where("content LIKE ? OR post_slug LIKE ?", "%"+search+"%", "%"+search+"%")
		}

		query.Count(&total)
		query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&comments)

		utils.Success(c, gin.H{
			"comments": comments,
			"total":    total,
		})
	}
}

func UpdateCommentStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		commentID := c.Param("id")

		var req struct {
			Status string `json:"status" binding:"required,oneof=pending approved rejected"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		var comment models.Comment
		if err := database.DB.First(&comment, commentID).Error; err != nil {
			utils.NotFound(c, "Comment not found")
			return
		}

		comment.Status = models.CommentStatus(req.Status)
		if err := database.DB.Save(&comment).Error; err != nil {
			utils.InternalError(c, "Failed to update comment status")
			return
		}

		database.DB.Preload("User").First(&comment, comment.ID)

		utils.Success(c, gin.H{"comment": comment})
	}
}

func DeleteAdminComment() gin.HandlerFunc {
	return func(c *gin.Context) {
		commentID := c.Param("id")

		var comment models.Comment
		if err := database.DB.First(&comment, commentID).Error; err != nil {
			utils.NotFound(c, "Comment not found")
			return
		}

		if err := database.DB.Delete(&comment).Error; err != nil {
			utils.InternalError(c, "Failed to delete comment")
			return
		}

		utils.Success(c, gin.H{"message": "Comment deleted"})
	}
}

func BatchCommentAction() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req BatchActionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		switch req.Action {
		case "approve":
			database.DB.Model(&models.Comment{}).Where("id IN ?", req.IDs).Update("status", models.CommentApproved)
		case "reject":
			database.DB.Model(&models.Comment{}).Where("id IN ?", req.IDs).Update("status", models.CommentRejected)
		case "delete":
			database.DB.Where("id IN ?", req.IDs).Delete(&models.Comment{})
		}

		utils.Success(c, gin.H{"message": "Batch action completed"})
	}
}
