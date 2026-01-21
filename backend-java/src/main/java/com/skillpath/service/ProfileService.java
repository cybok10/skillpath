
package com.skillpath.service;

import com.skillpath.dto.FullProfileResponse;
import com.skillpath.model.*;
import com.skillpath.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BadgeRepository badgeRepository;

    public ProfileService(UserRepository userRepository, UserSkillRepository userSkillRepository, 
                          ActivityLogRepository activityLogRepository, BadgeRepository badgeRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.activityLogRepository = activityLogRepository;
        this.badgeRepository = badgeRepository;
    }

    public FullProfileResponse getFullProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Ensure skills exist based on profile data
        if (userSkillRepository.findByUser(user).isEmpty()) {
            syncSkillsFromProfile(user);
        }

        FullProfileResponse response = new FullProfileResponse();
        
        // Map User
        FullProfileResponse.UserDTO userDTO = new FullProfileResponse.UserDTO();
        userDTO.setName(user.getFullName());
        userDTO.setEmail(user.getEmail());
        userDTO.setProfilePictureUrl(user.getProfilePictureUrl());
        userDTO.setXp(user.getXp());
        userDTO.setLevel(user.getLevel());
        userDTO.setStreak(user.getStreak());
        userDTO.setJoinDate(user.getJoinDate().toString());
        
        if (user.getProfile() != null) {
            FullProfileResponse.ProfileDTO pDTO = new FullProfileResponse.ProfileDTO();
            pDTO.setBio(user.getProfile().getBio());
            pDTO.setCareerGoal(user.getProfile().getCareerGoal());
            pDTO.setExperienceLevel(user.getProfile().getExperienceLevel());
            userDTO.setProfile(pDTO);
        }
        response.setUser(userDTO);

        // Fetch Related Data
        List<ActivityLog> allLogs = activityLogRepository.findTop10ByUserOrderByTimestampDesc(user);
        response.setRecentActivity(allLogs);
        response.setSkills(userSkillRepository.findByUser(user));
        response.setBadges(badgeRepository.findByUser(user));

        // Calculate Real-Time Stats
        FullProfileResponse.StatsDTO stats = new FullProfileResponse.StatsDTO();
        
        // Sum durationMinutes from all logs (in a real app, optimize this with a custom JPQL query)
        // Here we just estimate based on XP for demo if duration is missing, or use duration if present
        int totalMinutes = allLogs.stream()
            .mapToInt(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : (log.getXpEarned() / 2)) 
            .sum();
            
        stats.setTotalLearningHours(totalMinutes / 60);
        stats.setCoursesCompleted(activityLogRepository.countByUser(user));
        stats.setLabsCompleted(0); // Add repository method for specific counts if needed
        response.setStats(stats);

        // Calculate Career Readiness
        response.setCareerReadiness(calculateReadiness(user));

        return response;
    }

    public void syncSkillsFromProfile(User user) {
        if (user.getProfile() == null) return;
        
        List<String> preferredTech = user.getProfile().getPreferredTech();
        if (preferredTech == null || preferredTech.isEmpty()) {
            preferredTech = List.of("Communication", "Problem Solving");
        }

        List<UserSkill> existingSkills = userSkillRepository.findByUser(user);
        
        for (String tech : preferredTech) {
            boolean exists = existingSkills.stream()
                .anyMatch(s -> s.getSkillName().equalsIgnoreCase(tech));
            
            if (!exists) {
                UserSkill s = new UserSkill();
                s.setUser(user);
                s.setSkillName(tech.substring(0, 1).toUpperCase() + tech.substring(1)); 
                s.setCategory("Programming"); 
                s.setScore(10); 
                userSkillRepository.save(s);
            }
        }
    }

    private FullProfileResponse.CareerReadinessDTO calculateReadiness(User user) {
        FullProfileResponse.CareerReadinessDTO dto = new FullProfileResponse.CareerReadinessDTO();
        
        List<UserSkill> skills = userSkillRepository.findByUser(user);
        double avgSkill = skills.stream().mapToInt(UserSkill::getScore).average().orElse(0);
        
        int score = (int) ((avgSkill * 0.6) + (user.getLevel() * 2));
        if (score > 100) score = 100;

        dto.setScore(score);
        dto.setTargetRole(user.getProfile() != null ? user.getProfile().getCareerGoal() : "General Tech");
        
        if (score < 40) dto.setReadinessLevel("Low");
        else if (score < 70) dto.setReadinessLevel("Moderate");
        else if (score < 90) dto.setReadinessLevel("High");
        else dto.setReadinessLevel("Job Ready");

        List<String> missing = new ArrayList<>();
        if (avgSkill < 50) missing.add("Advanced Concepts");
        if (user.getXp() < 5000) missing.add("System Design");
        dto.setMissingSkills(missing);

        return dto;
    }
}
