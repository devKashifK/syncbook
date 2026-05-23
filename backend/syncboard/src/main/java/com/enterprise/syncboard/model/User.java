package com.enterprise.syncboard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID; 

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue 
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id; 

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}