
package com.skillpath.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String fullName;
    
    @Lob
    @Column(length = 1000000) // Support large Base64 strings
    private String profilePictureUrl;
    
    // Gamification & Stats
    private Long xp = 0L;
    private Integer level = 1;
    private Integer streak = 0;
    private LocalDateTime joinDate = LocalDateTime.now();
    private LocalDateTime lastActive;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;
}
