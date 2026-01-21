
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setJoinDate(LocalDateTime.now());
        
        userRepository.save(user);
        
        // Create empty profile
        createDefaultProfile(user);

        final String jwt = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(jwt, "bearer"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Incorrect email or password");
        }

        final String jwt = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.ok(new AuthResponse(jwt, "bearer"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody SocialLoginRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            // Register new user from Google
            user = new User();
            user.setEmail(request.getEmail());
            user.setFullName(request.getName());
            // Set a random password for social users (they won't use it, but DB needs it)
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); 
            user.setJoinDate(LocalDateTime.now());
            userRepository.save(user);

            createDefaultProfile(user);
        }

        final String jwt = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(jwt, "bearer"));
    }

    private void createDefaultProfile(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setBio("I am a new student ready to learn!");
        profileRepository.save(profile);
        user.setProfile(profile);
        userRepository.save(user);
    }
}
