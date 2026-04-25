package com.example.taskmanager.dto;

import java.time.LocalDateTime;

import com.example.taskmanager.entity.ActivityLog;

import lombok.Getter;

@Getter
public class ActivityLogResponse {
    private final Long id;
    private final String actorUsername;
    private final String action;
    private final String details;
    private final LocalDateTime createdAt;

    public ActivityLogResponse(ActivityLog log) {
        this.id            = log.getId();
        this.actorUsername = log.getActorUsername();
        this.action        = log.getAction();
        this.details       = log.getDetails();
        this.createdAt     = log.getCreatedAt();
    }
}
