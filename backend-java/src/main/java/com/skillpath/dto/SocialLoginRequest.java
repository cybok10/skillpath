
package com.skillpath.dto;

import lombok.Data;

@Data
public class SocialLoginRequest {
    private String email;
    private String name;
    private String providerId; // google, github etc
    private String photoUrl;
}
