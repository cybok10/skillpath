
package com.skillpath.controller;

import com.skillpath.dto.ProfileUpdateRequest;
import com.skillpath.model.Profile;
import com.skillpath.model.User;
import com.skillpath.repository.ProfileRepository;
import com.skillpath.repository.UserRepository;
import com.skillpath.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfileService profileService;

    public UserController(UserRepository userRepository, ProfileRepository profileRepository, ProfileService profileService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.profileService = profileService;
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // Update User Name if present
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setFullName(request.getName());
            userRepository.save(user);
        }

        // Update Profile Picture if present
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
            userRepository.save(user);
        }

        // Update Profile
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
        }

        if (request.getRole() != null) profile.setRole(request.getRole());
        if (request.getExperienceLevel() != null) profile.setExperienceLevel(request.getExperienceLevel());
        if (request.getCareerGoal() != null) profile.setCareerGoal(request.getCareerGoal());
        if (request.getPreferredTech() != null) profile.setPreferredTech(request.getPreferredTech());
        if (request.getLearningStyle() != null) profile.setLearningStyle(request.getLearningStyle());
        if (request.getCurrentProject() != null) profile.setCurrentProject(request.getCurrentProject());
        if (request.getAspiration() != null) profile.setAspiration(request.getAspiration());
        if (request.getBio() != null) profile.setBio(request.getBio());

        profileRepository.save(profile);
        user.setProfile(profile);
        userRepository.save(user);

        // Sync skills based on the new preferred technologies
        profileService.syncSkillsFromProfile(user);

        return ResponseEntity.ok().body("{\"status\": \"success\"}");
    }
}
