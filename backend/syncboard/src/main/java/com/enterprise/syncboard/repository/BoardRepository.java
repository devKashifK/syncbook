package com.enterprise.syncboard.repository;

import com.enterprise.syncboard.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardRepository extends JpaRepository<Board, UUID> {
    
    List<Board> findByProjectIdAndUserId(Long projectId, UUID userId);
    
    List<Board> findByUserId(UUID userId);
    
    Optional<Board> findByIdAndProjectIdAndUserId(UUID id, Long projectId, UUID userId);
}