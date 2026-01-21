
package com.skillpath.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String activityType; // COURSE, LAB, QUIZ, PROJECT
    private String title;
    private Integer xpEarned;
    private String skillTag;
    
    // New field for real-time dashboard stats
    private Integer durationMinutes = 0; 
    
    private LocalDateTime timestamp = LocalDateTime.now();
}
