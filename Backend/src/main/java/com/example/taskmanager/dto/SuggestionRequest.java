package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SuggestionRequest {

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;
}
