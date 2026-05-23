package com.enterprise.syncboard.repository;

import com.enterprise.syncboard.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Fetch all projects owned by the user
    List<Project> findByUserId(UUID userId);
    
    Optional<Project> findByProjectIdAndUserId(Long projectId, UUID userId);
}