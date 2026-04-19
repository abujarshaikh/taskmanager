package com.example.taskmanager.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskmanager.dto.SuggestionResponse;
import com.example.taskmanager.entity.Suggestion;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.repository.SuggestionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuggestionServiceImpl implements SuggestionService {

    private final SuggestionRepository suggestionRepository;

    @Override
    @Transactional
    public SuggestionResponse submit(String username, String message) {
        Suggestion suggestion = new Suggestion();
        suggestion.setUsername(username);
        suggestion.setMessage(message);
        return new SuggestionResponse(suggestionRepository.save(suggestion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuggestionResponse> getAll() {
        return suggestionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(SuggestionResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SuggestionResponse markAsRead(Long id) {
        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suggestion not found: " + id));
        suggestion.setRead(true);
        return new SuggestionResponse(suggestionRepository.save(suggestion));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUnreadReceipt(String username) {
        // Returns true if the user's latest suggestion has been read by admin
        return suggestionRepository
                .findTopByUsernameOrderByCreatedAtDesc(username)
                .map(Suggestion::isRead)
                .orElse(false);
    }

    // Runs every day at midnight — deletes suggestions read more than 7 days ago
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldReadSuggestions() {
        suggestionRepository.deleteOldReadSuggestions(LocalDateTime.now().minusDays(7));
    }
}
