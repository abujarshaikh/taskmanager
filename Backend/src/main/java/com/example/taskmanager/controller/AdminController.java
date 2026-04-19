package com.example.taskmanager.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskmanager.dto.UserStatsResponse;
import com.example.taskmanager.dto.UserSummaryResponse;
import com.example.taskmanager.enums.Role;
import com.example.taskmanager.enums.TaskStatus;
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
