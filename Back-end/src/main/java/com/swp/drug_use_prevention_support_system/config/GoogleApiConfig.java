package com.swp.drug_use_prevention_support_system.config;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.File;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Configuration
public class GoogleApiConfig {
    // Inject các giá trị từ application.properties/yml
    @Value("${google.api.tokens-directory-path:tokens}") // Giá trị mặc định là "tokens"
    private String tokensDirectoryPath;

    @Value("${google.api.credentials-file-path:/credentials.json}") // Giá trị mặc định là "/credentials.json"
    private String credentialsFilePath;

    @Value("${google.api.redirect-port:8889}") // Giá trị mặc định là 8889
    private int redirectPort;

    // Có thể cấu hình các scopes trong application.properties/yml hoặc giữ nguyên trong code
    // Ví dụ: google.api.scopes=https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/spreadsheets
    private static final List<String> SCOPES = List.of(
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/spreadsheets"
    );

    // Khai báo JsonFactory và NetHttpTransport là Beans để có thể tái sử dụng
    @Bean
    public JsonFactory googleJsonFactory() {
        return GsonFactory.getDefaultInstance();
    }

    @Bean
    public NetHttpTransport googleHttpTransport() throws GeneralSecurityException, IOException {
        return GoogleNetHttpTransport.newTrustedTransport();
    }

    // Khai báo Credential là một Spring Bean
    @Bean
    public Credential googleCredential(NetHttpTransport httpTransport, JsonFactory jsonFactory)
            throws IOException, GeneralSecurityException {

        InputStream in = getClass().getResourceAsStream(credentialsFilePath);
        if (in == null) {
            throw new IOException("Resource not found: " + credentialsFilePath);
        }

        GoogleClientSecrets clientSecrets =
                GoogleClientSecrets.load(jsonFactory, new InputStreamReader(in));

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, jsonFactory, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new File(tokensDirectoryPath)))
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(redirectPort).build();

        return new AuthorizationCodeInstalledApp(flow, receiver)
                .authorize("user"); // "user" là userId
    }
}
