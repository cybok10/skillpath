package com.skillpath.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    @JsonProperty("full_name")
    private String fullName;
}
