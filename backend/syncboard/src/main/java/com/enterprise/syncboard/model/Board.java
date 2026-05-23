package com.enterprise.syncboard.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "project_id")
    private Long projectId; 

    @Column(name = "user_id", nullable = false)
    private UUID userId;
}