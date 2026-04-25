package com.example.taskmanager.dto;

import java.time.LocalDateTime;

import com.example.taskmanager.entity.Comment;

import lombok.Getter;

@Getter
public class CommentResponse {
    private final Long id;
    private final String content;
    private final String username;
    private final String adminReply;
    private final LocalDateTime createdAt;

    public CommentResponse(Comment comment) {
        this.id         = comment.getId();
        this.content    = comment.getContent();
        this.username   = comment.getUsername();
        this.adminReply = comment.getAdminReply();
        this.createdAt  = comment.getCreatedAt();
    }
}
