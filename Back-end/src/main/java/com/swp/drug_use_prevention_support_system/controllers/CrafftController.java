package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.entities.CrafftSubmissionDTO;
import com.swp.drug_use_prevention_support_system.services.CrafftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/assessment/crafft")
public class CrafftController {

    @Autowired
    private CrafftService crafftService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitCrafft(@RequestBody CrafftSubmissionDTO dto) {
        AssessmentResult result = crafftService.processCrafftSubmission(dto);

        if (result.getAssessmentResultID() == null) {
            // Guest: trả về dữ liệu kết quả tạm thời
            return ResponseEntity.ok(Map.of(
                    "temp", true,
                    "score", result.getScore(),
                    "riskLevel", result.getRiskLevel(),
                    "suggestedAction", result.getSuggestedAction()
            ));
        }

        // Trả về id kết quả để frontend redirect sang trang kết quả
        return ResponseEntity.ok(Map.of(
                "resultId", result.getAssessmentResultID()
        ));
    }
}