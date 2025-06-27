package com.swp.drug_use_prevention_support_system.services;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.*;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.util.GoogleAuthUtil;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "Drug Use Prevention Sup Sys";

    public void getGGMeetAppointments() throws GeneralSecurityException, IOException {
        Calendar service = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GoogleAuthUtil.JSON_FACTORY,
                GoogleAuthUtil.getCredentials()
        ).setApplicationName(APPLICATION_NAME).build();

        DateTime now = new DateTime(System.currentTimeMillis());
        Events events = service.events().list("primary")
                .setMaxResults(10)
                .setTimeMin(now)
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();

        List<Event> items = events.getItems();
        if (items.isEmpty()) {
            System.out.println("No upcoming events found.");
        } else {
            System.out.println("Upcoming events");
            for (Event event : items) {
                DateTime start = event.getStart().getDateTime();
                if (start == null) start = event.getStart().getDate();
                System.out.printf("%s (%s)\n", event.getSummary(), start);
            }
        }
    }

    public String createGGMeetAppointment(CreateAppointmentRequest request) throws GeneralSecurityException, IOException {
        Calendar service = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GoogleAuthUtil.JSON_FACTORY,
                GoogleAuthUtil.getCredentials()
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
