
package com.skillpath.dto;

import lombok.Data;

@Data
public class ActivityRequest {
    private String type; // COURSE, LAB, etc.
    private String title;
    private Integer xp;
    private String skillTag;
    private Integer durationMinutes;
}
