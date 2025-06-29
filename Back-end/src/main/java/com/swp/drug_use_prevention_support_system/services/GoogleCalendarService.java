package com.swp.drug_use_prevention_support_system.services;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "Drug Use Prevention Sup Sys";

    // Inject Credential, NetHttpTransport và JsonFactory đã được định nghĩa là Spring Beans
    private final Credential googleCredential;
    private final NetHttpTransport httpTransport;
    private final JsonFactory jsonFactory;

    // Constructor để Spring tự động inject các dependencies
    public GoogleCalendarService(Credential googleCredential,
                                 NetHttpTransport httpTransport,
                                 JsonFactory jsonFactory) {
        this.googleCredential = googleCredential;
        this.httpTransport = httpTransport;
        this.jsonFactory = jsonFactory;
    }

    public String createGGMeetAppointment(CreateAppointmentRequest request) throws GeneralSecurityException, IOException {
        // Sử dụng các đối tượng đã được inject thay vì gọi lại phương thức getCredentials()
        Calendar service = new Calendar.Builder(
                this.httpTransport, // Sử dụng httpTransport đã inject
                this.jsonFactory,   // Sử dụng jsonFactory đã inject
                this.googleCredential // Sử dụng googleCredential đã inject
        ).setApplicationName(APPLICATION_NAME).build();

        Instant startInstant = request.getAppointmentDateTime();
        Instant endInstant = startInstant.plusSeconds(60 * 60); // 1h

        Event event = new Event()
                .setSummary("Tư vấn với " + request.getConsultantID())
                .setDescription(request.getNotes())
                .setStart(new EventDateTime()
                        .setDateTime(new DateTime(startInstant.toString()))
                        .setTimeZone("Asia/Ho_Chi_Minh"))
                .setEnd(new EventDateTime()
                        .setDateTime(new DateTime(endInstant.toString()))
                        .setTimeZone("Asia/Ho_Chi_Minh"))
                .setConferenceData(new ConferenceData()
                        .setCreateRequest(new CreateConferenceRequest()
                                .setRequestId("req-" + System.currentTimeMillis())
                                .setConferenceSolutionKey(
                                        new ConferenceSolutionKey().setType("hangoutsMeet")
                                )));

        Event createdEvent = service.events()
                .insert("primary", event)
                .setConferenceDataVersion(1)
                .execute();

        System.out.println("Lịch hẹn đã tạo: " + createdEvent.getHtmlLink());
        System.out.println("Google Meet: " + createdEvent.getHangoutLink());
        return createdEvent.getHangoutLink();
    }
}
