package com.swp.drug_use_prevention_support_system.services;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.BatchUpdateSpreadsheetRequest;
import com.google.api.services.sheets.v4.model.CellData;
import com.google.api.services.sheets.v4.model.ExtendedValue;
import com.google.api.services.sheets.v4.model.GridRange;
import com.google.api.services.sheets.v4.model.Request;
import com.google.api.services.sheets.v4.model.RowData;
import com.google.api.services.sheets.v4.model.UpdateCellsRequest;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleSheetsService {

    private final UserService userService;
    private final AssessmentService assessmentService;
    private final AssessmentResultRepository assessmentResultRepository;

    // Inject Credential, NetHttpTransport và JsonFactory đã được định nghĩa là Spring Beans
    private final Credential googleCredential;
    private final NetHttpTransport httpTransport;
    private final JsonFactory jsonFactory;

    private static final String APPLICATION_NAME = "Drug Use Prevention Sup Sys";
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    @Transactional
    public void importDataFromSheet() throws GeneralSecurityException, IOException {
        // Sử dụng các đối tượng đã được inject thay vì gọi lại phương thức getCredentials()
        Sheets service = new Sheets.Builder(
                this.httpTransport, // Sử dụng httpTransport đã inject
                this.jsonFactory,   // Sử dụng jsonFactory đã inject
                this.googleCredential // Sử dụng googleCredential đã inject
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
            // Cẩn thận với IndexOutOfBoundsException nếu hàng không đủ cột
            if (row.size() < 7 || !"yes".equalsIgnoreCase(row.get(6).toString())) {
                try {
                    // Đảm bảo rằng các cột không rỗng trước khi chuyển đổi
                    Integer score = (row.get(0) != null) ? Integer.valueOf(row.get(0).toString()) : null;
                    RiskLevel level = (row.get(1) != null) ? RiskLevel.valueOf(row.get(1).toString()) : null;
                    String action = (row.get(2) != null) ? row.get(2).toString() : null;
                    Instant completed = (row.get(3) != null) ? Instant.parse(row.get(3).toString()) : null;
                    String email = (row.get(4) != null) ? row.get(4).toString() : null;

                    User user = null;
                    if (email != null) {
                        try {
                            user = userService.getUserEntityByEmail(email);
                        } catch (Exception userEx) {
                            System.err.println("User not found for email: " + email + " at row " + (i + 2) + ". Skipping this row.");
                            continue;
                        }
                    } else {
                        System.err.println("Email is null at row " + (i + 2) + ". Skipping this row.");
                        continue;
                    }

                    AssessmentType type = (row.get(5) != null) ? AssessmentType.valueOf(row.get(5).toString()) : null;
                    Assessment assessment = null;
                    if (type != null) {
                        try {
                            assessment = assessmentService.getAssessmentEntity(type);
                        } catch (Exception assessmentEx) {
                            System.err.println("Assessment not found for type: " + type + " at row " + (i + 2) + ". Skipping this row.");
                            continue;
                        }
                    } else {
                        System.err.println("AssessmentType is null at row " + (i + 2) + ". Skipping this row.");
                        continue;
                    }


                    results.add(AssessmentResult.builder()
                            .score(score)
                            .riskLevel(level)
                            .suggestedAction(action)
                            .completedTime(completed)
                            .user(user)
                            .assessment(assessment)
                            .build());

                    syncedRows.add(i + 2); // Sheet starts from row 2 (header is row 1)
                } catch (IndexOutOfBoundsException e) {
                    System.err.println("Row " + (i + 2) + " does not have enough columns. Skipping.");
                } catch (IllegalArgumentException e) {
                    System.err.println("Data format error at row " + (i + 2) + ": " + e.getMessage() + ". Skipping.");
                } catch (Exception e) {
                    System.err.println("Error processing row " + (i + 2) + ": " + e.getMessage());
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

    // Đảm bảo @EnableScheduling được đặt ở lớp Main Application
    @Scheduled(fixedRate = 5000) // Chạy mỗi 5 giây
    public void syncGoogleSheetsData() {
        try {
            // Có thể thêm logging ở đây để biết khi nào tác vụ bắt đầu
            System.out.println("Starting Google Sheets data sync...");
            importDataFromSheet();
            System.out.println("Google Sheets data sync completed.");
        } catch (Exception e) {
            System.err.println("Failed to sync Google Sheets data: " + e.getMessage());
            e.printStackTrace(); // In ra stack trace để dễ debug hơn
        }
    }
}