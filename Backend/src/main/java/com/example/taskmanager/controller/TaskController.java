package com.example.taskmanager.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskmanager.dto.CommentRequest;
import com.example.taskmanager.dto.PageResponse;
import com.example.taskmanager.dto.StatusRequest;
import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.dto.TaskStats;
import com.example.taskmanager.service.TaskService;
import com.example.taskmanager.util.AppConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Validated
public class TaskController {

	private final TaskService taskService;

	@PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
	@PostMapping
	public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(taskService.createTask(request));
	}

	@GetMapping
	public PageResponse<TaskResponse> getTasks(
			Authentication authentication,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "4") int size) {
		boolean isAdmin = authentication.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals(AppConstants.ROLE_ADMIN));
		Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
		return isAdmin ? taskService.getAllTask(pageable) : taskService.getUserTasks(pageable);
	}

	@GetMapping("/stats")
	public TaskStats getStats() {
		return taskService.getStats();
	}

	@PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
	@GetMapping("/{id}")
	public TaskResponse getTaskById(@PathVariable Long id) {
		return taskService.getTaskByID(id);
	}

	@PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
	@PutMapping("/{id}")
	public ResponseEntity<TaskResponse> updateTask(
			@PathVariable Long id,
			@Valid @RequestBody TaskRequest request) {
		return ResponseEntity.ok(taskService.updateTask(id, request));
	}

	// Both users (own tasks) and admins (any task) can update status
	@PatchMapping("/{id}/status")
	public ResponseEntity<TaskResponse> updateTaskStatus(
			@PathVariable("id") Long taskId,
			@Valid @RequestBody StatusRequest request,
			Authentication authentication) {
		boolean isAdmin = authentication.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals(AppConstants.ROLE_ADMIN));
		return ResponseEntity.ok(taskService.updateTaskStatus(taskId, request.getStatus(), isAdmin));
	}

	// Comment sent as JSON body — not a query param (avoids encoding issues with long text)
	@PatchMapping("/{id}/comment")
	public ResponseEntity<TaskResponse> addComment(
			@PathVariable("id") Long taskId,
			@Valid @RequestBody CommentRequest request) {
		return ResponseEntity.ok(taskService.addComment(taskId, request.getComment()));
	}

	@PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
		taskService.deleteTask(id);
		return ResponseEntity.noContent().build();
	}
}
