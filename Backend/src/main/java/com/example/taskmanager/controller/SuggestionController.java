package com.example.taskmanager.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskmanager.dto.SuggestionReplyRequest;
import com.example.taskmanager.dto.SuggestionRequest;
import com.example.taskmanager.dto.SuggestionResponse;
import com.example.taskmanager.service.SuggestionService;
import com.example.taskmanager.util.AppConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    // User — submit a suggestion
    @PostMapping
    public ResponseEntity<SuggestionResponse> submit(
            @Valid @RequestBody SuggestionRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(suggestionService.submit(authentication.getName(), request.getMessage()));
    }

    // User — check if admin has read their latest suggestion
    @GetMapping("/receipt")
    public ResponseEntity<Boolean> checkReceipt(Authentication authentication) {
        return ResponseEntity.ok(suggestionService.hasUnreadReceipt(authentication.getName()));
    }

    // User — get admin reply on their latest suggestion
    @GetMapping("/my-reply")
    public ResponseEntity<Map<String, String>> getReply(Authentication authentication) {
        String reply = suggestionService.getReplyForUser(authentication.getName());
        return ResponseEntity.ok(Map.of("reply", reply != null ? reply : ""));
    }

    // Admin — get all suggestions
    @PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
    @GetMapping("/all")
    public ResponseEntity<List<SuggestionResponse>> getAll() {
        return ResponseEntity.ok(suggestionService.getAll());
    }

    // Admin — mark a suggestion as read
    @PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
    @PatchMapping("/{id}/read")
    public ResponseEntity<SuggestionResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(suggestionService.markAsRead(id));
    }

    // Admin — reply to a suggestion
    @PreAuthorize("hasAuthority('" + AppConstants.ROLE_ADMIN + "')")
    @PatchMapping("/{id}/reply")
    public ResponseEntity<SuggestionResponse> reply(
            @PathVariable Long id,
            @Valid @RequestBody SuggestionReplyRequest request) {
        return ResponseEntity.ok(suggestionService.replyToSuggestion(id, request.getReply()));
    }
}
