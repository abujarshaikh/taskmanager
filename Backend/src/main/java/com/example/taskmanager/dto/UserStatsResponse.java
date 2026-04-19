package com.example.taskmanager.dto;

import lombok.Getter;

@Getter
public class UserStatsResponse {
    private final String username;
    private final long pending;
    private final long inProgress;
    private final long completed;
    private final long total;

    public UserStatsResponse(String username, long pending, long inProgress, long completed) {
        this.username = username;
        this.pending = pending;
        this.inProgress = inProgress;
        this.completed = completed;
        this.total = pending + inProgress + completed;
    }
}
