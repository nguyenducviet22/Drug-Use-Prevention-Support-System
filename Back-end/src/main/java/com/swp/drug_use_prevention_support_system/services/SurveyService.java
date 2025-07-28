package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SurveyCreateRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SurveyUpdateRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.SurveyDTO;
import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import com.swp.drug_use_prevention_support_system.domain.entities.Survey;
import com.swp.drug_use_prevention_support_system.repositories.EventRepository;
import com.swp.drug_use_prevention_support_system.repositories.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final EventRepository eventRepository;

    @PreAuthorize("hasRole('STAFF')")
    public SurveyDTO createSurvey(SurveyCreateRequest request) {
        Event event = eventRepository.findById(request.getEventID())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Kiểm tra trạng thái sự kiện
        List<String> allowedStatuses = List.of("APPROVED", "NOT_STARTED", "ONGOING");
        if (!allowedStatuses.contains(event.getStatus())) {
            throw new RuntimeException("Cannot create survey for event with status: " + event.getStatus());
        }

        // Kiểm tra trùng lặp type
        boolean exists = surveyRepository.existsByEventEventIDAndType(request.getEventID(), request.getType());
        if (exists) {
            throw new RuntimeException("Survey of type " + request.getType() + " already exists for this event");
        }

        Survey survey = Survey.builder()
                .formLink(request.getFormLink())
                .type(request.getType())
                .event(event)
                .build();

        survey = surveyRepository.save(survey);

        return new SurveyDTO(
                survey.getSurveyID(),
                event.getEventID(),
                survey.getFormLink(),
                survey.getType()
        );
    }

    @PreAuthorize("hasRole('STAFF')")
    public List<SurveyDTO> getAllSurveys() {
        return surveyRepository.findAll().stream().map(survey ->
                new SurveyDTO(
                        survey.getSurveyID(),
                        survey.getEvent().getEventID(),
                        survey.getFormLink(),
                        survey.getType()
                )
        ).toList();
    }

    @PreAuthorize("hasRole('STAFF')")
    public SurveyDTO updateSurvey(UUID surveyId, SurveyUpdateRequest request) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        // Kiểm tra trạng thái sự kiện
        List<String> allowedStatuses = List.of("APPROVED", "NOT_STARTED", "ONGOING");
        if (!allowedStatuses.contains(survey.getEvent().getStatus())) {
            throw new RuntimeException("Cannot update survey for event with status: " + survey.getEvent().getStatus());
        }

        // Kiểm tra trùng lặp type (nếu type thay đổi)
        if (!survey.getType().equals(request.getType())) {
            boolean exists = surveyRepository.existsByEventEventIDAndType(
                    survey.getEvent().getEventID(), request.getType());
            if (exists) {
                throw new RuntimeException("Survey of type " + request.getType() + " already exists for this event");
            }
        }

        survey.setFormLink(request.getFormLink());
        survey.setType(request.getType());

        surveyRepository.save(survey);

        return new SurveyDTO(
                survey.getSurveyID(),
                survey.getEvent().getEventID(),
                survey.getFormLink(),
                survey.getType()
        );
    }
}
