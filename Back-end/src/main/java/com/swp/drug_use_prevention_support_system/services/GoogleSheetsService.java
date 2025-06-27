package com.swp.drug_use_prevention_support_system.services;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import com.swp.drug_use_prevention_support_system.util.GoogleAuthUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class GoogleSheetsService {

    private final UserService userService;
    private final AssessmentService assessmentService;
    private final AssessmentResultRepository assessmentResultRepository;

    private static final String APPLICATION_NAME = "Drug Use Prevention Sup Sys";
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    @Transactional
    public void importDataFromSheet() throws GeneralSecurityException, IOException {
        Sheets service = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GoogleAuthUtil.JSON_FACTORY,
                GoogleAuthUtil.getCredentials()
        ).setApplicationName(APPLICATION_NAME).build();

        final String spreadsheetId = "1jgbyNjZjwAhzaA0XcyVwu3NIxHQpXdGuPK_YEbJnOhM";
        final String sheetName = "AssessmentResults";
        final String range = sheetName + "!A2:G";

        ValueRange response = service.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();

        List<List<Object>> values = response.getValues();
        if (values == null || values.isEmpty()) {
            System.out.println("No data found.");
            return;
        }

        List<AssessmentResult> results = new ArrayList<>();
        List<Integer> syncedRows = new ArrayList<>();

        for (int i = 0; i < values.size(); i++) {
            List<Object> row = values.get(i);
            if (row.size() < 7 || !"yes".equalsIgnoreCase(row.get(6).toString())) {
                try {
                    Integer score = Integer.valueOf(row.get(0).toString());
                    RiskLevel level = RiskLevel.valueOf(row.get(1).toString());
                    String action = row.get(2).toString();
                    LocalDateTime completed = LocalDateTime.parse(row.get(3).toString(), DATETIME_FORMATTER);
                    String username = row.get(4).toString();
                    User user = userService.getUserEntity(username);
                    AssessmentType type = AssessmentType.valueOf(row.get(5).toString());
                    Assessment assessment = assessmentService.getAssessmentEntity(type);

                    results.add(AssessmentResult.builder()
                            .score(score)
                            .riskLevel(level)
                            .suggestedAction(action)
                            .completedTime(completed)
                            .user(user)
                            .assessment(assessment)
                            .build());

                    syncedRows.add(i + 2); // Sheet starts from row 2
                } catch (Exception e) {
                    throw new RuntimeException("Error at row " + (i + 2) + ": " + e.getMessage(), e);
                }
            }
        }

        if (!results.isEmpty()) {
            assessmentResultRepository.saveAll(results);

            Integer sheetId = service.spreadsheets().get(spreadsheetId).execute()
                    .getSheets().stream()
                    .filter(s -> s.getProperties().getTitle().equals(sheetName))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Sheet '" + sheetName + "' not found"))
                    .getProperties().getSheetId();

//            List<Request> updateRequests = syncedRows.stream()
//                    .map(rowNumber -> new Request().setUpdateCells(
//                            new UpdateCellsRequest()
//                                    .setRows(List.of(new RowData().setValues(List.of(
//                                            new CellData().setUserEnteredValue(
//                                                    new ExtendedValue().setStringValue("yes"))))))
//                                    .setFields("userEnteredValue")
//                                    .setRange(new GridRange()
//                                            .setSheetId(sheetId)
//                                            .setStartRowIndex(rowNumber - 1)
//                                            .setEndRowIndex(rowNumber)
//                                            .setStartColumnIndex(6)
//                                            .setEndColumnIndex(7)
//                                    )))
//                    ).collect(toList());

            List<Request> updateRequests = new ArrayList<>();
            for (Integer rowNumber : syncedRows) {
                List<CellData> valuesToUpdate = List.of(
                        new CellData().setUserEnteredValue(new ExtendedValue().setStringValue("yes"))
                );

                updateRequests.add(new Request().setUpdateCells(
                        new UpdateCellsRequest()
                                .setRows(List.of(new RowData().setValues(valuesToUpdate)))
                                .setFields("userEnteredValue")
                                .setRange(new GridRange()
                                        .setSheetId(sheetId)
                                        .setStartRowIndex(rowNumber - 1)
                                        .setEndRowIndex(rowNumber)
                                        .setStartColumnIndex(6) // Cột G = index 6
                                        .setEndColumnIndex(7)
                                )
                ));
            }

            BatchUpdateSpreadsheetRequest batchRequest = new BatchUpdateSpreadsheetRequest()
                    .setRequests(updateRequests);

            service.spreadsheets().batchUpdate(spreadsheetId, batchRequest).execute();
            System.out.println("Synced " + results.size() + " rows and updated 'Synced' column.");
        }
    }

    @Scheduled(fixedRate = 1000) // mỗi 1 giây
    public void syncGoogleSheetsData() {
        try {
            importDataFromSheet();
        } catch (Exception e) {
            System.err.println("Failed to sync: " + e.getMessage());
        }
    }
}