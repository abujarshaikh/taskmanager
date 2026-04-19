package com.example.taskmanager.service;

import java.util.List;

import com.example.taskmanager.dto.SuggestionResponse;

public interface SuggestionService {
    SuggestionResponse submit(String username, String message);
    List<SuggestionResponse> getAll();
    SuggestionResponse markAsRead(Long id);
    boolean hasUnreadReceipt(String username);
}
