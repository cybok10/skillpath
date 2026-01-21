package com.skillpath.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "profiles")
@Data
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String role;
    private String experienceLevel;
    private String careerGoal;
    
    @Column(length = 1000)
    private String bio;
    
    private String learningStyle;
    private String currentProject;
    private String aspiration;

    @ElementCollection
    private List<String> preferredTech;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
