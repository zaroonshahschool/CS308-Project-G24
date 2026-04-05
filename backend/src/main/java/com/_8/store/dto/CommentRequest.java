package com._8.store.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {

    @NotBlank(message = "Content must not be empty")
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
