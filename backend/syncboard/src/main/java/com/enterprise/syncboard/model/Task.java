package com.enterprise.syncboard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @Column(name = "board_uuid", nullable = false) 
    private String boardId;

    @Column(name = "task_name", nullable = false, columnDefinition = "text")
    private String taskName;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "time_set_by_user")
    private String timeSetByUser;

    @Column(name = "time_taken_by_user")
    private String timeTakenByUser;

    @Column(name = "user_id") 
    private UUID userId;
}