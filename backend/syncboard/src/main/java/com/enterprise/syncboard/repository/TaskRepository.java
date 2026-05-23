package com.enterprise.syncboard.repository;

import com.enterprise.syncboard.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBoardIdAndUserId(Long boardId, UUID userId);
    
    List<Task> findByUserId(UUID userId);

    Optional<Task> findByIdAndUserId(Long id, UUID userId);
}