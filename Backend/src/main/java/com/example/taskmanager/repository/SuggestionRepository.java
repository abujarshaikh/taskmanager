package com.example.taskmanager.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.taskmanager.entity.Suggestion;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    List<Suggestion> findAllByOrderByCreatedAtDesc();

    Optional<Suggestion> findTopByUsernameOrderByCreatedAtDesc(String username);

    // Auto-cleanup: delete suggestions marked as read more than 7 days ago
    @Modifying
    @Query("DELETE FROM Suggestion s WHERE s.read = true AND s.createdAt < :cutoff")
    void deleteOldReadSuggestions(@Param("cutoff") LocalDateTime cutoff);
}
