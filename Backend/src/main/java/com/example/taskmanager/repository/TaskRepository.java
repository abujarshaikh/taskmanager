package com.example.taskmanager.repository;

import java.util.List;
import java.util.Optional;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.taskmanager.entity.TaskEntity;
import com.example.taskmanager.enums.Role;
import com.example.taskmanager.enums.TaskStatus;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
	Page<TaskEntity> findByUser_Username(String username, Pageable pageable);
	Optional<TaskEntity> findByIdAndUser_Username(Long id, String username);
	long countByStatus(TaskStatus status);

	@Query("SELECT t.status, COUNT(t) FROM TaskEntity t WHERE t.user.username = :username GROUP BY t.status")
	List<Object[]> countByStatusForUser(@Param("username") String username);

	@Query("SELECT t.user.username, t.status, COUNT(t) FROM TaskEntity t " +
	       "WHERE t.user IS NOT NULL AND t.user.role = :role " +
	       "GROUP BY t.user.username, t.status")
	List<Object[]> countTasksGroupedByUserAndStatus(@Param("role") Role role);

	// Overdue: due date is before today and status is not COMPLETED
	@Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.dueDate < :today AND t.status != :status")
	long countOverdue(@Param("today") LocalDate today, @Param("status") TaskStatus status);

	// Tasks created per day for last N days
	@Query("SELECT CAST(t.createdAt AS date), COUNT(t) FROM TaskEntity t " +
	       "WHERE t.createdAt >= :from GROUP BY CAST(t.createdAt AS date) ORDER BY CAST(t.createdAt AS date) ASC")
	List<Object[]> countTasksCreatedPerDay(@Param("from") java.time.LocalDateTime from);
}
