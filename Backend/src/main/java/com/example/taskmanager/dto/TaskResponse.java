package com.example.taskmanager.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.taskmanager.entity.TaskEntity;
import com.example.taskmanager.enums.Priority;
import com.example.taskmanager.enums.TaskStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String comments;
    private TaskStatus status;
    private Priority priority;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private String assignedTo;

    public static TaskResponse from(TaskEntity task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setComments(task.getComments());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDueDate(task.getDueDate());
        response.setCreatedAt(task.getCreatedAt());
        response.setAssignedTo(task.getAssignedTo());
        return response;
    }
}
