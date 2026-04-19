package com.example.taskmanager.dto;

import java.time.LocalDateTime;

import com.example.taskmanager.entity.Suggestion;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;

@Getter
public class SuggestionResponse {

    private final Long id;
    private final String username;
    private final String message;
    @JsonProperty("isRead")
    private final boolean isRead;
    private final LocalDateTime createdAt;

    public SuggestionResponse(Suggestion s) {
        this.id        = s.getId();
        this.username  = s.getUsername();
        this.message   = s.getMessage();
        this.isRead    = s.isRead();
        this.createdAt = s.getCreatedAt();
    }
}
