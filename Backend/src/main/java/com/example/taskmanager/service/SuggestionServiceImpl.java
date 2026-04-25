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
import com.example.taskmanager.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuggestionServiceImpl implements SuggestionService {

    private final SuggestionRepository suggestionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

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
    @Transactional
    public SuggestionResponse replyToSuggestion(Long id, String reply) {
        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suggestion not found: " + id));
        suggestion.setReply(reply);
        suggestion.setRead(true);
        Suggestion saved = suggestionRepository.save(suggestion);

        // Send email reply to user
        userRepository.findByUsername(saved.getUsername()).ifPresent(user ->
            emailService.sendSuggestionReply(user.getEmail(), user.getUsername(), reply)
        );

        return new SuggestionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String getReplyForUser(String username) {
        return suggestionRepository
                .findTopByUsernameOrderByCreatedAtDesc(username)
                .map(Suggestion::getReply)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUnreadReceipt(String username) {
        return suggestionRepository
                .findTopByUsernameOrderByCreatedAtDesc(username)
                .map(Suggestion::isRead)
                .orElse(false);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldReadSuggestions() {
        suggestionRepository.deleteOldReadSuggestions(LocalDateTime.now().minusDays(7));
    }
}
