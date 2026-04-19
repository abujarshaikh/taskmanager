package com.example.taskmanager.service;

import org.springframework.data.domain.Pageable;

import com.example.taskmanager.dto.PageResponse;
import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.dto.TaskStats;
import com.example.taskmanager.enums.TaskStatus;

public interface TaskService {

	PageResponse<TaskResponse> getAllTask(Pageable pageable);

	TaskStats getStats();

	TaskResponse getTaskByID(Long id);

	TaskResponse updateTask(Long id, TaskRequest request);

	void deleteTask(Long id);

	TaskResponse updateTaskStatus(Long taskId, TaskStatus status, boolean isAdmin);

	PageResponse<TaskResponse> getUserTasks(Pageable pageable);

	TaskResponse addComment(Long taskId, String comment);

	TaskResponse createTask(TaskRequest request);

}
