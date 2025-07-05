package com.swp.drug_use_prevention_support_system.domain.entities;

import lombok.Data;

@Data
public class CrafftSubmissionDTO {
    private String username;
    private int question1;
    private int question2;
    private int question3;
    private int question4;
    private String car;
    private String relax;
    private String alone;
    private String forget;
    private String family;
    private String trouble;
}
