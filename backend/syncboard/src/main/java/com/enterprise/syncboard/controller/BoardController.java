package com.enterprise.syncboard.controller;

import com.enterprise.syncboard.config.JwtUtil;
import com.enterprise.syncboard.model.Board;
import com.enterprise.syncboard.model.User;
import com.enterprise.syncboard.repository.BoardRepository;
import com.enterprise.syncboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "*")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // 0. GET ALL BOARDS FOR USER
    @GetMapping
    public ResponseEntity<?> getAllUserBoards(
            @RequestHeader("Authorization") String authHeader) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token layer."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            List<Board> boards = boardRepository.findByUserId(userId);

            return ResponseEntity.ok(boards);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed or user not found."));
        }
    }

    // 1. GET BOARDS BY PROJECT ID
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectBoards(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long projectId) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token layer."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            List<Board> boards = boardRepository.findByProjectIdAndUserId(projectId, userId);

            if (boards.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "no boards found for this project"));
            }

            return ResponseEntity.ok(boards);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed or user not found."));
        }
    }

    // 1.5 GET BOARD BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBoardById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID id) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing token."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Optional<Board> boardOpt = boardRepository.findById(id);
            if (boardOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Board not found."));
            }
            Board board = boardOpt.get();

            if (!board.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access."));
            }

            return ResponseEntity.ok(board);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed."));
        }
    }

    // 2. CREATE A NEW BOARD UNDER A PROJECT
    @PostMapping
    public ResponseEntity<?> createBoard(
            @RequestHeader("Authorization") String authHeader, 
            @RequestBody Map<String, String> request) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token layer."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            String boardName = request.get("name");
            String projectIdStr = request.get("projectId");

            if (boardName == null || boardName.trim().isEmpty() || projectIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Board name and projectId are required."));
            }

            Long projectId = Long.parseLong(projectIdStr);

            Board newBoard = new Board();
            newBoard.setName(boardName);
            newBoard.setProjectId(projectId);
            newBoard.setUserId(userId);

            boardRepository.save(newBoard);

            return ResponseEntity.ok(Map.of(
                "message", "Board created successfully!",
                "board", newBoard
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Failed to create board."));
        }
    }

    // 3. RENAME BOARD
    @PutMapping("/{id}")
    public ResponseEntity<?> renameBoard(
            @RequestHeader("Authorization") String authHeader, 
            @PathVariable UUID id, 
            @RequestBody Map<String, String> request) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            String projectIdStr = request.get("projectId");
            if (projectIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "projectId is required in payload."));
            }
            Long projectId = Long.parseLong(projectIdStr);

            Optional<Board> boardOpt = boardRepository.findByIdAndProjectIdAndUserId(id, projectId, userId);
            if (boardOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Board not found or unauthorized."));
            }
            Board board = boardOpt.get();

            String newName = request.get("name");
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Board name is required."));
            }

            board.setName(newName.trim());
            boardRepository.save(board);

            return ResponseEntity.ok(Map.of("message", "Board renamed successfully", "board", board));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed."));
        }
    }

    // 4. DELETE BOARD
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBoard(
            @RequestHeader("Authorization") String authHeader, 
            @PathVariable UUID id,
            @RequestParam("projectId") Long projectId) {
            
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization token."));
        }
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.getEmailFromToken(token);
            UUID userId = userRepository.findByEmail(email).orElseThrow().getId();

            Optional<Board> boardOpt = boardRepository.findByIdAndProjectIdAndUserId(id, projectId, userId);
            if (boardOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Board not found or unauthorized."));
            }

            boardRepository.delete(boardOpt.get());

            return ResponseEntity.ok(Map.of("message", "Board deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed."));
        }
    }
}