package com.example.taskmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Async
    public void sendTaskAssigned(String toEmail, String username, String taskTitle) {
        send(toEmail,
            "New Task Assigned — " + taskTitle,
            "Hi " + username + ",\n\n" +
            "A new task has been assigned to you:\n\n" +
            "Task: " + taskTitle + "\n\n" +
            "Login to your dashboard to view the details.\n\n" +
            "Task Manager");
    }

    @Async
    public void sendTaskUpdated(String toEmail, String username, String taskTitle) {
        send(toEmail,
            "Task Updated — " + taskTitle,
            "Hi " + username + ",\n\n" +
            "Your task has been updated:\n\n" +
            "Task: " + taskTitle + "\n\n" +
            "Login to your dashboard to view the changes.\n\n" +
            "Task Manager");
    }

    @Async
    public void sendSuggestionReply(String toEmail, String username, String reply) {
        send(toEmail,
            "Admin replied to your feedback",
            "Hi " + username + ",\n\n" +
            "The admin has replied to your feedback:\n\n" +
            reply + "\n\n" +
            "Task Manager");
    }

    @Async
    public void sendNewUserRegistered(String username, String email) {
        send(adminEmail,
            "New User Registered — " + username,
            "A new user has registered:\n\n" +
            "Username: " + username + "\n" +
            "Email: " + email + "\n\n" +
            "Task Manager");
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.debug("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
