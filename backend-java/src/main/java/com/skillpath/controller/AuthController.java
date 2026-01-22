
package com.skillpath.controller;

import com.skillpath.dto.AuthRequest;
import com.skillpath.dto.AuthResponse;
import com.skillpath.dto.RegisterRequest;
import com.skillpath.dto.SocialLoginRequest;
import com.skillpath.model.User;
import com.skillpath.model.Profile;
import com.skillpath.repository.UserRepository;
import com.skillpath.repository.ProfileRepository;
import com.skillpath.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    
    // In production, this would be in application.properties
    private final String FRONTEND_URL = "http://localhost:5173/#/auth/callback"; 

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, 
                         UserRepository userRepository, ProfileRepository profileRepository, 
                         PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        createUserFlow(request.getEmail(), request.getFullName(), request.getPassword());
        final String jwt = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.ok(new AuthResponse(jwt, "bearer"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
            updateUserStats(user);
            final String jwt = jwtUtil.generateToken(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(jwt, "bearer"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Incorrect email or password");
        }
    }

    /**
     * OAuth 2.0 Flow Simulation:
     * 1. Frontend calls this endpoint.
     * 2. Backend would normally redirect to Provider (Google/GitHub).
     * 3. Provider redirects back with code.
     * 4. Backend exchanges code for token & profile.
     * 
     * Since we lack real API Keys for this demo, we simulate the "Success Callback" immediately
     * and persist the user to the SQL database.
     */
    @GetMapping("/signin/{provider}")
    public void socialLoginRedirect(@PathVariable String provider, HttpServletResponse response) throws IOException {
        String email;
        String name;
        String profilePic;

        // Simulate fetching user data from provider
        if ("github".equalsIgnoreCase(provider)) {
            email = "dev_student@github.com";
            name = "GitHub Developer";
            profilePic = "https://ui-avatars.com/api/?name=GitHub+Dev&background=0D1117&color=fff";
        } else if ("linkedin".equalsIgnoreCase(provider)) {
            email = "pro_networker@linkedin.com";
            name = "LinkedIn Pro";
            profilePic = "https://ui-avatars.com/api/?name=LinkedIn+Pro&background=0077b5&color=fff";
        } else {
            email = "google_user@gmail.com";
            name = "Google User";
            profilePic = "https://ui-avatars.com/api/?name=Google+User&background=DB4437&color=fff";
        }

        // Check if user exists in SQL DB, else create
        Optional<User> existing = userRepository.findByEmail(email);
        User user;
        if (existing.isPresent()) {
            user = existing.get();
            updateUserStats(user);
        } else {
            user = createUserFlow(email, name, UUID.randomUUID().toString());
            user.setProfilePictureUrl(profilePic);
            userRepository.save(user);
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        // Redirect back to Frontend
        response.sendRedirect(FRONTEND_URL + "?token=" + token);
    }

    private User createUserFlow(String email, String name, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(name);
        user.setJoinDate(LocalDateTime.now());
        user.setLastActive(LocalDateTime.now());
        user.setStreak(1);
        user.setXp(0L);
        user.setLevel(1);
        
        userRepository.save(user);
        createDefaultProfile(user);
        return user;
    }

    private void createDefaultProfile(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setBio("Ready to accelerate my career!");
        profile.setCareerGoal("Software Engineer");
        profileRepository.save(profile);
        user.setProfile(profile);
        userRepository.save(user);
    }
    
    private void updateUserStats(User user) {
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastActive() != null) {
            long days = ChronoUnit.DAYS.between(user.getLastActive().toLocalDate(), now.toLocalDate());
            if (days == 1) {
                user.setStreak((user.getStreak() == null ? 0 : user.getStreak()) + 1);
            } else if (days > 1) {
                user.setStreak(1);
            }
            if (user.getStreak() == null) user.setStreak(1);
        } else {
            user.setStreak(1);
        }
        user.setLastActive(now);
        userRepository.save(user);
    }
}
