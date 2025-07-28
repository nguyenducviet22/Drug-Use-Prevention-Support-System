package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SurveyCreateRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SurveyUpdateRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.SurveyDTO;
import com.swp.drug_use_prevention_support_system.domain.entities.Survey;
import com.swp.drug_use_prevention_support_system.services.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping
    public ResponseEntity<SurveyDTO> createSurvey(@RequestBody SurveyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(surveyService.createSurvey(request));
    }


    @GetMapping
    public ResponseEntity<List<SurveyDTO>> getAllSurveys() {
        return ResponseEntity.ok(surveyService.getAllSurveys());
    }

    @PutMapping("/{surveyId}")
    public ResponseEntity<SurveyDTO> updateSurvey(
            @PathVariable UUID surveyId,
            @RequestBody SurveyUpdateRequest request) {
        return ResponseEntity.ok(surveyService.updateSurvey(surveyId, request));
    }

}

