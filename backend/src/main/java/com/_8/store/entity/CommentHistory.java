package com._8.store.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment_history")
public class CommentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @Column(name = "previous_content", nullable = false, columnDefinition = "TEXT")
    private String previousContent;

    @Column(name = "edited_at", nullable = false)
    private LocalDateTime editedAt;

    public CommentHistory() {}

    public CommentHistory(Comment comment, String previousContent, LocalDateTime editedAt) {
        this.comment = comment;
        this.previousContent = previousContent;
        this.editedAt = editedAt;
    }

    public Long getId() { return id; }
    public Comment getComment() { return comment; }
    public String getPreviousContent() { return previousContent; }
    public LocalDateTime getEditedAt() { return editedAt; }

    public void setId(Long id) { this.id = id; }
    public void setComment(Comment comment) { this.comment = comment; }
    public void setPreviousContent(String previousContent) { this.previousContent = previousContent; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
}
