
package com.skillpath.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/job-prep")
public class JobPrepController {

    // Simulating a database for the purpose of this example
    private final Map<String, List<Map<String, Object>>> domainModules = new HashMap<>();

    public JobPrepController() {
        // Init Mock Data
        List<Map<String, Object>> commModules = new ArrayList<>();
        commModules.add(Map.of("id", "comm-1", "title", "English Speaking Avatar", "type", "ai-tutor", "difficulty", "Medium"));
        commModules.add(Map.of("id", "comm-2", "title", "Grammar Mastery", "type", "learning", "difficulty", "Easy"));
        domainModules.put("communication", commModules);
        
        List<Map<String, Object>> aptModules = new ArrayList<>();
        aptModules.add(Map.of("id", "apt-1", "title", "Quantitative Aptitude", "type", "practice", "difficulty", "Medium"));
        domainModules.put("aptitude", aptModules);
    }

    @GetMapping("/domains")
    public ResponseEntity<?> getDomains() {
        // Return list of available domains
        return ResponseEntity.ok(List.of(
            Map.of("id", "communication", "title", "Communication Skills", "category", "Non-Tech"),
            Map.of("id", "fullstack", "title", "Full Stack Dev", "category", "Tech"),
            Map.of("id", "aptitude", "title", "Aptitude & Reasoning", "category", "Aptitude")
        ));
    }

    @GetMapping("/domains/{id}/modules")
    public ResponseEntity<?> getModules(@PathVariable String id) {
        if (domainModules.containsKey(id)) {
            return ResponseEntity.ok(domainModules.get(id));
        }
        // Return generic empty list or default modules if ID not found in mock
        return ResponseEntity.ok(List.of(
             Map.of("id", id + "-1", "title", "Core Concepts", "type", "learning", "difficulty", "Easy")
        ));
    }
    
    @PostMapping("/progress")
    public ResponseEntity<?> saveProgress(@RequestBody Map<String, Object> progress) {
        // Logic to save progress to DB
        return ResponseEntity.ok(Map.of("status", "saved"));
    }
}
