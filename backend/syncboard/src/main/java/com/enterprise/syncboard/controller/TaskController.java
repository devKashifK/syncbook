package com.enterprise.syncboard.controller;

import com.enterprise.syncboard.config.JwtUtil;
import com.enterprise.syncboard.model.Task;
import com.enterprise.syncboard.model.User;
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
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // GET ALL TASKS FOR A USER
    @GetMapping
    public ResponseEntity<?> getAllTasks(
            @RequestHeader("Authorization") String authHeader) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token layer."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            List<Task> tasks = taskRepository.findByUserId(userId);

            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed or user not found."));
        }
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<?> getTasksByBoard(
            @RequestHeader("Authorization") String authHeader, 
            @PathVariable("boardId") Long boardId) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token layer."));
        }

        String token = authHeader.substring(7);

        try {
            // 1. Decode the user session identity from the JWT
            String email = jwtUtil.getEmailFromToken(token);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User profile not found."));
            }

            UUID userId = userOpt.get().getId();

            // 2. Query all tasks inside this board belonging to this specific user
            List<Task> tasks = taskRepository.findByBoardIdAndUserId(boardId, userId);

            // 3. Fallback check: If no tasks exist, return an empty array or a user friendly notification
            if (tasks.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No tasks found in this board yet."));
            }

            return ResponseEntity.ok(tasks);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Token validation failed."));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createTask(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token layer."));
        }
        String token = authHeader.substring(7);

        // Extract required attributes from your TablePlus structural blueprint
        String boardIdStr = request.get("boardId");
        String taskName = request.get("taskName");
        String status = request.get("status"); // e.g., "TODO", "IN_PROGRESS"
        String description = request.get("description");
        String timeSetByUser = request.get("timeSetByUser");

        if (boardIdStr == null || taskName == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: boardId, taskName, or status."));
        }

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            // Instantiate and populate the Task entity matching your precise data types
            Task newTask = new Task();
            newTask.setBoardId(Long.parseLong(boardIdStr));
            newTask.setTaskName(taskName);
            newTask.setStatus(status);
            newTask.setDescription(description);
            newTask.setTimeSetByUser(timeSetByUser);
            newTask.setUserId(userId);
            newTask.setCreatedAt(java.time.LocalDateTime.now()); // Automatically stamp the creation time

            Task savedTask = taskRepository.save(newTask);
            return ResponseEntity.ok(savedTask);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Token authentication failed."));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long taskId,
            @RequestBody Map<String, String> request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token layer."));
        }
        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Task task = taskRepository.findByIdAndUserId(taskId, userId)
                    .orElseThrow(() -> new RuntimeException("Task not found or unauthorized."));

            if (request.containsKey("taskName")) task.setTaskName(request.get("taskName"));
            if (request.containsKey("description")) task.setDescription(request.get("description"));
            if (request.containsKey("timeSetByUser")) task.setTimeSetByUser(request.get("timeSetByUser"));
            if (request.containsKey("timeTakenByUser")) task.setTimeTakenByUser(request.get("timeTakenByUser"));

            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeTaskStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long taskId,
            @RequestBody Map<String, String> request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token."));
        }
        String token = authHeader.substring(7);
        String newStatus = request.get("status");

        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field cannot be empty."));
        }

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Task task = taskRepository.findByIdAndUserId(taskId, userId)
                    .orElseThrow(() -> new RuntimeException("Task not found."));

            task.setStatus(newStatus);
            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long taskId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token."));
        }
        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Task task = taskRepository.findByIdAndUserId(taskId, userId)
                    .orElseThrow(() -> new RuntimeException("Task not found."));

            taskRepository.delete(task);
            return ResponseEntity.ok(Map.of("message", "Task removed successfully."));

        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}