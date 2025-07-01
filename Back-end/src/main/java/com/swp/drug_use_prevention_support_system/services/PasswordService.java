package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.MailBody;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ResetPasswordRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ForgotPasswordResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Password;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.mappers.PasswordMapper;
import com.swp.drug_use_prevention_support_system.repositories.PasswordRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final PasswordRepository passwordRepository;
    private final PasswordMapper passwordMapper;
    private final EmailService emailService;
    private final UserService userService;

    private static final int OTP_EXPIRATION_MINUTES = 10;

    @Transactional
    public ForgotPasswordResponse generateOtp() {
        String loginUsername = userService.getLoginUsername();
        User user = userService.getUserEntity(loginUsername);
        String email = user.getEmail();
        String otp = String.valueOf(new Random().nextInt(100_000, 999_999));
        Instant expiryTime = Instant.now().plus(OTP_EXPIRATION_MINUTES, ChronoUnit.MINUTES);

        passwordRepository.deleteByEmail(email);
        Password newPassword = Password.builder()
                .email(email)
                .otp(otp)
                .expiryTime(expiryTime)
                .build();
        passwordRepository.save(newPassword);
        return passwordMapper.toDto(newPassword);
    }

    public void sendOtpEmail(String email, String otp) throws MessagingException {
        MailBody mailBody = MailBody.builder()
                .to(email)
                .subject("Password Reset OTP")
                .content("Your OTP code to reset your password is: " + otp + "\n"
                        + "This code will expire in " + OTP_EXPIRATION_MINUTES + " minutes.\n"
                        + "If you did not request this, please ignore this email.")
                .build();
        emailService.sendEmail(mailBody);
    }

    public boolean verifyOtp(ResetPasswordRequest request) {
        String loginUsername = userService.getLoginUsername();
        User user = userService.getUserEntity(loginUsername);
        String email = user.getEmail();
        String otp = request.getOtp();
        Password password = passwordRepository.findByEmailAndOtp(email, otp);

        if (password.getExpiryTime().isBefore(Instant.now())){
            return false;
        }
        return userService.changePassword(request.getNewPassword());
    }
}
