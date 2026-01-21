
package com.skillpath.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    private String name; // To update User.fullName
    private String profilePictureUrl; // Base64 image or URL
    private String role;
    private String experienceLevel;
    private String careerGoal;
    private String bio;
    private String learningStyle;
    private String currentProject;
    private String aspiration;
    private List<String> preferredTech;
}
