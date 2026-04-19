package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {

    @NotBlank(message = "Comment cannot be blank")
    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;
}
