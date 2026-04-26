package com.example.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TasksOverTimeResponse {
    private final String date;
    private final long count;
}
