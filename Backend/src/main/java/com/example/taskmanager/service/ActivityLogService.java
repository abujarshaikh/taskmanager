package com.example.taskmanager.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskmanager.dto.ActivityLogResponse;
import com.example.taskmanager.entity.ActivityLog;
import com.example.taskmanager.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void log(String actorUsername, String action, String details) {
        ActivityLog log = new ActivityLog();
        log.setActorUsername(actorUsername);
        log.setAction(action);
        log.setDetails(details);
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getRecent(int limit) {
        return activityLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(ActivityLogResponse::new)
                .collect(Collectors.toList());
    }
}
