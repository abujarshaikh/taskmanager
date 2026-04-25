package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SuggestionReplyRequest {

    @NotBlank(message = "Reply cannot be blank")
    @Size(max = 1000, message = "Reply must not exceed 1000 characters")
    private String reply;
}
