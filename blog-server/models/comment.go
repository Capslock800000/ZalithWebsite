package models

type CommentWithReplies struct {
	Comment
	Replies []CommentWithReplies `json:"replies,omitempty"`
}
