package com.example.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TaskStats {
    private final long pending;
    private final long inProgress;
    private final long completed;
    private final long total;
}
