package com.swp.drug_use_prevention_support_system;

import com.google.api.client.auth.oauth2.Credential;
import com.swp.drug_use_prevention_support_system.services.GoogleCalendarService;
import com.swp.drug_use_prevention_support_system.services.GoogleSheetsService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

@SpringBootTest
class DrugUsePreventionSupportSystemApplicationTests {

    @MockBean
    private Credential googleCredential;

    @MockBean
    private GoogleSheetsService googleSheetsService;

    @MockBean
    private GoogleCalendarService googleCalendarService;

    @MockBean
    private JavaMailSender mailSender;

    @Test
    void contextLoads() {
    }
}
