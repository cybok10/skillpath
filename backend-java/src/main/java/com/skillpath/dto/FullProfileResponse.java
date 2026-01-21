
package com.skillpath.dto;

import com.skillpath.model.User;
import com.skillpath.model.UserSkill;
import com.skillpath.model.ActivityLog;
import com.skillpath.model.Badge;
import lombok.Data;
import java.util.List;

@Data
public class FullProfileResponse {
    private UserDTO user;
    private List<UserSkill> skills;
    private List<ActivityLog> recentActivity;
    private List<Badge> badges;
    private CareerReadinessDTO careerReadiness;
    private StatsDTO stats;

    @Data
    public static class UserDTO {
        private String name;
        private String email;
        private String profilePictureUrl;
        private String role;
        private Long xp;
        private Integer level;
        private Integer streak;
        private String joinDate;
        private ProfileDTO profile;
    }

    @Data
    public static class ProfileDTO {
        private String careerGoal;
        private String bio;
        private String experienceLevel;
    }

    @Data
    public static class CareerReadinessDTO {
        private Integer score;
        private List<String> missingSkills;
        private String targetRole;
        private String readinessLevel;
    }

    @Data
    public static class StatsDTO {
        private Integer totalLearningHours;
        private Integer coursesCompleted;
        private Integer labsCompleted;
    }
}
