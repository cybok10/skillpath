
package com.skillpath.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_skills")
@Data
public class UserSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String skillName;
    private String category; // Programming, Networking, etc.
    private Integer score; // 0-100

    public String getLevel() {
        if (score < 30) return "Beginner";
        if (score < 70) return "Intermediate";
        return "Advanced";
    }
}
