package com.example.taskmanager.dto;

import com.example.taskmanager.enums.TaskStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}
