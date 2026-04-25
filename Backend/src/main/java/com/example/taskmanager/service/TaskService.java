package com.example.taskmanager.service;

import org.springframework.data.domain.Pageable;

import com.example.taskmanager.dto.CommentResponse;
import com.example.taskmanager.dto.PageResponse;
import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.dto.TaskStats;
import com.example.taskmanager.enums.TaskStatus;

public interface TaskService {

    TaskResponse createTask(TaskRequest request);
    PageResponse<TaskResponse> getAllTask(Pageable pageable);
    PageResponse<TaskResponse> getUserTasks(Pageable pageable);
    TaskStats getStats();
    TaskResponse getTaskByID(Long id);
    TaskResponse updateTask(Long id, TaskRequest request);
    void deleteTask(Long id);
    TaskResponse updateTaskStatus(Long taskId, TaskStatus status, boolean isAdmin);
    CommentResponse addComment(Long taskId, String content);
    CommentResponse replyToComment(Long commentId, String reply);
}
