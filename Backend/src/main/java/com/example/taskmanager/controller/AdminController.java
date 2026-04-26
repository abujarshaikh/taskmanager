package com.example.taskmanager.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskmanager.dto.ActivityLogResponse;
import com.example.taskmanager.dto.AnalyticsSummaryResponse;
import com.example.taskmanager.dto.TasksOverTimeResponse;
import com.example.taskmanager.dto.UserStatsResponse;
import com.example.taskmanager.dto.UserSummaryResponse;
import com.example.taskmanager.enums.Role;
import com.example.taskmanager.enums.TaskStatus;
import com.example.taskmanager.service.ActivityLogService;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.util.AppConstants;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;

    @GetMapping("/activity")
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getActivityLog() {
        return activityLogService.getRecent(50);
    }

    @GetMapping("/analytics/summary")
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getAnalyticsSummary() {
        long pending    = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long completed  = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long overdue    = taskRepository.countOverdue(LocalDate.now(), TaskStatus.COMPLETED);
        return new AnalyticsSummaryResponse(pending + inProgress + completed, pending, inProgress, completed, overdue);
    }

    @GetMapping("/analytics/tasks-over-time")
    @Transactional(readOnly = true)
    public List<TasksOverTimeResponse> getTasksOverTime() {
        LocalDateTime from = LocalDateTime.now().minusDays(29).toLocalDate().atStartOfDay();
        List<Object[]> rows = taskRepository.countTasksCreatedPerDay(from);

        // Build a map of existing data
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> dataMap = new HashMap<>();
        for (Object[] row : rows) {
            String date = row[0].toString().substring(0, 10);
            dataMap.put(date, (long) row[1]);
        }

        // Fill in all 30 days — days with no tasks get count 0
        List<TasksOverTimeResponse> result = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            String date = LocalDate.now().minusDays(i).format(fmt);
            result.add(new TasksOverTimeResponse(date, dataMap.getOrDefault(date, 0L)));
        }
        return result;
    }

    @GetMapping("/users/stats")
    @Transactional(readOnly = true)
    public List<UserStatsResponse> getUserStats() {
        List<Object[]> rows = taskRepository.countTasksGroupedByUserAndStatus(Role.ROLE_USER);

        Map<String, long[]> statsMap = new HashMap<>();
        for (Object[] row : rows) {
            String username = (String) row[0];
            TaskStatus status = (TaskStatus) row[1];
            long count = (long) row[2];

            statsMap.computeIfAbsent(username, u -> new long[3]);
            long[] counts = statsMap.get(username);
            if (status == TaskStatus.PENDING)     counts[0] = count;
            if (status == TaskStatus.IN_PROGRESS) counts[1] = count;
            if (status == TaskStatus.COMPLETED)   counts[2] = count;
        }

        // Include users with zero tasks
        userRepository.findByRole(Role.ROLE_USER).forEach(user ->
            statsMap.computeIfAbsent(user.getUsername(), u -> new long[3])
        );

        return statsMap.entrySet().stream()
                .map(e -> new UserStatsResponse(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                .collect(Collectors.toList());
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getUsersWithPendingCount() {
        List<Object[]> rows = taskRepository.countTasksGroupedByUserAndStatus(Role.ROLE_USER);

        Map<String, Long> pendingMap = new HashMap<>();
        for (Object[] row : rows) {
            if (row[1] == TaskStatus.PENDING) {
                pendingMap.put((String) row[0], (long) row[2]);
            }
        }

        return userRepository.findByRole(Role.ROLE_USER).stream()
                .map(user -> new UserSummaryResponse(
                        user.getUsername(),
                        pendingMap.getOrDefault(user.getUsername(), 0L)))
                .collect(Collectors.toList());
    }
}
