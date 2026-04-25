package com.example.taskmanager.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskmanager.dto.CommentResponse;
import com.example.taskmanager.dto.PageResponse;
import com.example.taskmanager.dto.TaskRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.dto.TaskStats;
import com.example.taskmanager.entity.Comment;
import com.example.taskmanager.entity.TaskEntity;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.enums.TaskStatus;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.exception.UnauthorizedException;
import com.example.taskmanager.repository.CommentRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

    private final TaskRepository taskRepo;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        log.debug("Creating task, assigning to user: {}", request.getAssignTo());
        TaskEntity task = toEntity(request);
        task.setStatus(TaskStatus.PENDING);

        if (request.getAssignTo() != null && !request.getAssignTo().isEmpty()) {
            User assignedUser = userRepository.findByUsername(request.getAssignTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found: " + request.getAssignTo()));
            task.setUser(assignedUser);
        }

        TaskEntity saved = taskRepo.save(task);

        // Email notification
        if (saved.getUser() != null) {
            emailService.sendTaskAssigned(saved.getUser().getEmail(), saved.getUser().getUsername(), saved.getTitle());
        }

        // Activity log
        activityLogService.log(getCurrentUsername(), "TASK_CREATED",
                "Created task '" + saved.getTitle() + "'" +
                (saved.getAssignedTo() != null ? " assigned to " + saved.getAssignedTo() : ""));

        return TaskResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> getAllTask(Pageable pageable) {
        return new PageResponse<>(taskRepo.findAll(pageable).map(TaskResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> getUserTasks(Pageable pageable) {
        return new PageResponse<>(taskRepo.findByUser_Username(getCurrentUsername(), pageable).map(TaskResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public TaskStats getStats() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            long pending    = taskRepo.countByStatus(TaskStatus.PENDING);
            long inProgress = taskRepo.countByStatus(TaskStatus.IN_PROGRESS);
            long completed  = taskRepo.countByStatus(TaskStatus.COMPLETED);
            return new TaskStats(pending, inProgress, completed, pending + inProgress + completed);
        }
        long pending = 0, inProgress = 0, completed = 0;
        for (Object[] row : taskRepo.countByStatusForUser(getCurrentUsername())) {
            TaskStatus status = (TaskStatus) row[0];
            long count = (long) row[1];
            if (status == TaskStatus.PENDING)     pending    = count;
            if (status == TaskStatus.IN_PROGRESS) inProgress = count;
            if (status == TaskStatus.COMPLETED)   completed  = count;
        }
        return new TaskStats(pending, inProgress, completed, pending + inProgress + completed);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskByID(Long id) {
        return TaskResponse.from(taskRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id)));
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        TaskEntity existingTask = taskRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        TaskEntity updated = toEntity(request);
        existingTask.setTitle(updated.getTitle());
        existingTask.setDescription(updated.getDescription());
        existingTask.setPriority(updated.getPriority());
        existingTask.setDueDate(updated.getDueDate());

        if (request.getAssignTo() != null && !request.getAssignTo().isEmpty()) {
            User assignedUser = userRepository.findByUsername(request.getAssignTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found: " + request.getAssignTo()));
            existingTask.setUser(assignedUser);
        }

        TaskEntity saved = taskRepo.save(existingTask);

        // Email notification
        if (saved.getUser() != null) {
            emailService.sendTaskUpdated(saved.getUser().getEmail(), saved.getUser().getUsername(), saved.getTitle());
        }

        // Activity log
        activityLogService.log(getCurrentUsername(), "TASK_UPDATED", "Updated task '" + saved.getTitle() + "'");

        return TaskResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        TaskEntity task = taskRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        String title = task.getTitle();
        taskRepo.deleteById(id);
        activityLogService.log(getCurrentUsername(), "TASK_DELETED", "Deleted task '" + title + "'");
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, boolean isAdmin) {
        TaskEntity task;
        if (isAdmin) {
            task = taskRepo.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        } else {
            task = taskRepo.findByIdAndUser_Username(taskId, getCurrentUsername())
                    .orElseThrow(() -> new UnauthorizedException("Task not found or unauthorized"));
        }
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (status != TaskStatus.COMPLETED) {
            task.setCompletedAt(null);
        }
        return TaskResponse.from(taskRepo.save(task));
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long taskId, String content) {
        String username = getCurrentUsername();
        TaskEntity task = taskRepo.findByIdAndUser_Username(taskId, username)
                .orElseThrow(() -> new UnauthorizedException("Task not found or unauthorized"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUsername(username);
        comment.setTask(task);
        return new CommentResponse(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public CommentResponse replyToComment(Long commentId, String reply) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        comment.setAdminReply(reply);
        return new CommentResponse(commentRepository.save(comment));
    }

    private TaskEntity toEntity(TaskRequest request) {
        TaskEntity task = new TaskEntity();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            try {
                task.setDueDate(LocalDate.parse(request.getDueDate()));
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid date format. Expected yyyy-MM-dd, got: " + request.getDueDate(), e);
            }
        }
        return task;
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
