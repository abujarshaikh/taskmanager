package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentReplyRequest {

    @NotBlank(message = "Reply cannot be blank")
    @Size(max = 500, message = "Reply must not exceed 500 characters")
    private String reply;
}
