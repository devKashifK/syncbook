package com.enterprise.syncboard.controller;

import com.enterprise.syncboard.config.JwtUtil;
import com.enterprise.syncboard.model.Project;
import com.enterprise.syncboard.model.Board;
import com.enterprise.syncboard.model.Task;
import com.enterprise.syncboard.model.User;
import com.enterprise.syncboard.repository.ProjectRepository;
import com.enterprise.syncboard.repository.BoardRepository;
import com.enterprise.syncboard.repository.TaskRepository;
import com.enterprise.syncboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private BoardRepository boardRepository;
    
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. GET ALL PROJECTS FOR USER
    @GetMapping
    public ResponseEntity<?> getUserProjects(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token layer."));
        }
        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            List<Project> projects = projectRepository.findByUserId(userId);
            if (projects.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "no projects found for this user"));
            }
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Token authentication failed."));
        }
    }

    // 2. CREATE A NEW PROJECT
    @PostMapping("/create")
    public ResponseEntity<?> createProject(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token."));
        }
        String token = authHeader.substring(7);
        String projectName = request.get("projectName");
        String projectDescription = request.get("projectDescription");

        if (projectName == null || projectName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Project name cannot be empty."));
        }

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Project project = new Project();
            project.setProjectName(projectName);
            project.setProjectDescription(projectDescription);
            project.setUserId(userId);

            Project savedProject = projectRepository.save(project);
            return ResponseEntity.ok(savedProject);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Failed to create project."));
        }
    }

    // 3. UPDATE/RENAME A PROJECT
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long projectId,
            @RequestBody Map<String, String> request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token."));
        }
        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Project project = projectRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found or unauthorized."));

            if (request.containsKey("projectName")) project.setProjectName(request.get("projectName"));
            if (request.containsKey("projectDescription")) project.setProjectDescription(request.get("projectDescription"));

            Project updatedProject = projectRepository.save(project);
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // 4. DELETE A PROJECT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@RequestHeader("Authorization") String authHeader, @PathVariable("id") Long projectId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token."));
        }
        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Project project = projectRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found or unauthorized."));

            List<Board> boards = boardRepository.findByProjectIdAndUserId(projectId, userId);
            for (Board board : boards) {
                try {
                    String bId = board.getId().toString();
                    List<Task> tasks = taskRepository.findByBoardIdAndUserId(bId, userId);
                    taskRepository.deleteAll(tasks);
                } catch (Exception ignored) {
                }
            }
            boardRepository.deleteAll(boards);

            projectRepository.delete(project);
            return ResponseEntity.ok(Map.of("message", "Project deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}