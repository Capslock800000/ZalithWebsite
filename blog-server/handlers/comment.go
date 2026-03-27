package handlers

import (
	"blog-server/database"
	"blog-server/models"
	"blog-server/utils"

	"github.com/gin-gonic/gin"
)

type CreateCommentRequest struct {
	PostSlug string `json:"postSlug" binding:"required"`
	ParentID *uint  `json:"parentId"`
	Content  string `json:"content" binding:"required,min=1,max=1000"`
}

func GetComments() gin.HandlerFunc {
	return func(c *gin.Context) {
		postSlug := c.Param("post_slug")

		var comments []models.Comment
		if err := database.DB.Preload("User").
			Where("post_slug = ? AND status = ?", postSlug, models.CommentApproved).
			Order("created_at DESC").
			Find(&comments).Error; err != nil {
			utils.InternalError(c, "Failed to fetch comments")
			return
		}

		commentMap := make(map[uint]*models.CommentWithReplies)
		var rootComments []models.CommentWithReplies

		for i := range comments {
			commentWithReplies := &models.CommentWithReplies{
				Comment: comments[i],
				Replies: []models.CommentWithReplies{},
			}
			commentMap[comments[i].ID] = commentWithReplies
		}

		for i := range comments {
			if comments[i].ParentID == nil {
				rootComments = append(rootComments, *commentMap[comments[i].ID])
			} else {
				if parent, ok := commentMap[*comments[i].ParentID]; ok {
					parent.Replies = append(parent.Replies, *commentMap[comments[i].ID])
				}
			}
		}

		utils.Success(c, gin.H{
			"comments": rootComments,
			"total":    len(comments),
		})
	}
}

func CreateComment() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("userId")

		var req CreateCommentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.BadRequest(c, "Invalid request data")
			return
		}

		comment := models.Comment{
			PostSlug: req.PostSlug,
			UserID:   userID,
			ParentID: req.ParentID,
			Content:  req.Content,
			Status:   models.CommentPending,
		}

		if err := database.DB.Create(&comment).Error; err != nil {
			utils.InternalError(c, "Failed to create comment")
			return
		}

		database.DB.Preload("User").First(&comment, comment.ID)

		utils.Created(c, gin.H{"comment": comment})
	}
}

func DeleteComment() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("userId")
		role := c.GetString("role")
		commentID := c.Param("id")

		var comment models.Comment
		if err := database.DB.First(&comment, commentID).Error; err != nil {
			utils.NotFound(c, "Comment not found")
			return
		}

		if comment.UserID != userID && role != string(models.RoleAdmin) && role != string(models.RoleModerator) {
			utils.Forbidden(c, "You can only delete your own comments")
			return
		}

		if err := database.DB.Delete(&comment).Error; err != nil {
			utils.InternalError(c, "Failed to delete comment")
			return
		}

		utils.Success(c, gin.H{"message": "Comment deleted"})
	}
}
