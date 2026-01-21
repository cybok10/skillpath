
package com.skillpath.controller;

import com.skillpath.dto.ActivityRequest;
import com.skillpath.model.ActivityLog;
import com.skillpath.model.User;
import com.skillpath.repository.ActivityLogRepository;
import com.skillpath.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityController(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/log")
    public ResponseEntity<?> logActivity(@RequestBody ActivityRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setActivityType(request.getType());
        log.setTitle(request.getTitle());
        log.setXpEarned(request.getXp());
        log.setSkillTag(request.getSkillTag());
        log.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 0);
        log.setTimestamp(LocalDateTime.now());

        // Update User Aggregate Stats
        user.setXp(user.getXp() + request.getXp());
        user.setLastActive(LocalDateTime.now());
        
        // Simple level up logic: Level up every 1000 XP
        int newLevel = (int) (user.getXp() / 1000) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }

        userRepository.save(user);
        activityLogRepository.save(log);

        return ResponseEntity.ok().body("{\"status\": \"logged\", \"newXp\": " + user.getXp() + "}");
    }
}
