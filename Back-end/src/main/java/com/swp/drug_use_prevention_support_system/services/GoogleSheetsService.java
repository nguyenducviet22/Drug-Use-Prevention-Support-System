package com.swp.drug_use_prevention_support_system.services;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.*;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GoogleSheetsService {

    private final UserService userService;
    private final AssessmentService assessmentService;
    private final AssessmentResultRepository assessmentResultRepository;
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
    private static final String APPLICATION_NAME = "Google Sheets API Java Quickstart";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String TOKENS_DIRECTORY_PATH = "tokens";

    private static final List<String> SCOPES =
            Collections.singletonList(SheetsScopes.SPREADSHEETS); // full read-write scope
    private static final String CREDENTIALS_FILE_PATH = "/credentials.json";

    private static Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT)
            throws IOException {
        // Load client secrets.
        InputStream in = GoogleSheetsService.class.getResourceAsStream(CREDENTIALS_FILE_PATH);
        if (in == null) {
            throw new FileNotFoundException("Resource not found: " + CREDENTIALS_FILE_PATH);
        }
        GoogleClientSecrets clientSecrets =
                GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

        // Build flow and trigger user authorization request.
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    public void importDataFromSheet() throws GeneralSecurityException, IOException {
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        final String spreadsheetId = "1jgbyNjZjwAhzaA0XcyVwu3NIxHQpXdGuPK_YEbJnOhM";
        final String sheetName = "AssessmentResults";
        final String range = sheetName + "!A2:G";

        Sheets service = new Sheets.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
                .setApplicationName(APPLICATION_NAME)
                .build();

        ValueRange response = service.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();

        List<List<Object>> values = response.getValues();
        List<AssessmentResult> results = new ArrayList<>();
        List<Integer> syncedRows = new ArrayList<>();

        if (values == null || values.isEmpty()) {
            System.out.println("No data found.");
            return;
        }

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

                    AssessmentResult result = AssessmentResult.builder()
                            .score(score)
                            .riskLevel(level)
                            .suggestedAction(action)
                            .completedTime(completed)
                            .user(user)
                            .assessment(assessment)
                            .build();

                    results.add(result);
                    syncedRows.add(i + 2); // vì sheet bắt đầu từ dòng 2
                } catch (Exception e) {
                    throw new RuntimeException("Error at row " + (i + 2) + ": " + e.getMessage(), e);
                }
            }
        }

        if (!results.isEmpty()) {
            // Lưu dữ liệu mới vào DB
            assessmentResultRepository.saveAll(results);

            // Lấy sheetId để cập nhật ô G
            Integer sheetId = service.spreadsheets().get(spreadsheetId).execute()
                    .getSheets().stream()
                    .filter(s -> s.getProperties().getTitle().equals(sheetName))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Sheet '" + sheetName + "' not found"))
                    .getProperties().getSheetId();

            // Chuẩn bị request cập nhật "yes" vào cột G
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

            // Gửi batch update
            BatchUpdateSpreadsheetRequest batchRequest = new BatchUpdateSpreadsheetRequest()
                    .setRequests(updateRequests);
            service.spreadsheets().batchUpdate(spreadsheetId, batchRequest).execute();

            System.out.println("Synced " + results.size() + " rows and updated 'Synced' column.");
        }
//        else {
//            System.out.println("No new data to sync.");
//        }
    }

    @Scheduled(fixedRate = 1000) // 1 second
    public void syncGoogleSheetsData() {
        try {
            importDataFromSheet();
//            System.out.println("Synced data from Google Sheets at " + LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Failed to sync: " + e.getMessage());
        }
    }
}
