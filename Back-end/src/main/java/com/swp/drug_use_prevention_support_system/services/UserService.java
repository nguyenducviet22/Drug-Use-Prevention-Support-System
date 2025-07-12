package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.mappers.UserMapper;
import com.swp.drug_use_prevention_support_system.repositories.AppointmentRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse register(CreateUserRequest request) {
        String username = request.getUsername();
        if (userRepository.existsByUsername(username))
            throw new RuntimeException("Username existed with: " + username);
        User newUser = userMapper.toEntity(request);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        newUser.setRole(null);
        newUser.setStatus(UserStatus.ACTIVE);
        userRepository.save(newUser);
        return userMapper.toDto(newUser);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public UserResponse createInternalUser(CreateUserRequest request) {
        User internalUser = userMapper.toEntity(register(request));
        internalUser.setRole(request.getRole());
        userRepository.save(internalUser);
        return userMapper.toDto(internalUser);
    }

    @PreAuthorize("hasAnyRole('CONSULTANT', 'STAFF')")
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> userMapper.toDto(user))
                .toList();
    }

    public User getUserEntity(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User does not exist with username: " + username));
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User does not exist with email: " + email));
    }

    public String getLoginUsername() {
        var context = SecurityContextHolder.getContext();
        return context.getAuthentication().getName();
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse getMyInfo() {
        User user = getUserEntity(getLoginUsername());
        return userMapper.toDto(user);
    }

    @PreAuthorize("hasAnyRole('CONSULTANT', 'STAFF')")
    public UserResponse getUserByUsername(String username) {
        User user = getUserEntity(username);
        return userMapper.toDto(user);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse updateUser(String username,
                                   UpdateUserRequest request) {
        User user = getUserEntity(username);
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        LocalDate dob = request.getDob();
        user.setDob(dob);
        user.setAgeGroup(classifyAgeGroup(dob));
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setJob(request.getJob());
        user.setAddress(request.getAddress());
        user.setRole(Role.MEMBER);
        userRepository.save(user);
        return userMapper.toDto(user);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public void deleteUser(String username) {
        User user = getUserEntity(username);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    public List<UserResponse> getUsersByRole(Role role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream().map(user -> userMapper.toDto(user)).toList();
    }

    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public List<UserResponse> getAllUsersByDateDuration(Instant startedAt,  Instant endedAt) {
        List<User> users = userRepository.findByCreatedAtBetween(startedAt, endedAt);
        return users.stream()
                .map(user -> userMapper.toDto(user))
                .toList();
    }

    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public List<UserResponse> getUsersByRoleAndDateDuration(Role role,  Instant startedAt,  Instant endedAt) {
        List<User> users = userRepository.findByRoleAndCreatedAtBetween(role, startedAt, endedAt);
        return users.stream()
                .map(user -> userMapper.toDto(user))
                .toList();
    }

    public List<UserResponse> getUsersByStatus(UserStatus status) {
        List<User> users = userRepository.findByStatus(status);
        return users.stream()
                .map(user -> userMapper.toDto(user))
                .toList();
    }

    public List<UserResponse> getUsersByStatusAndRole(UserStatus status, Role role) {
        List<User> users = userRepository.findByStatusAndRole(status, role);
        return users.stream()
                .map(user -> userMapper.toDto(user))
                .toList();
    }

    public List<UserResponse> getMembersOfConsultant(String username) {
        List<User> members = appointmentRepository.findByConsultantUsername(username).stream()
                .map(Appointment::getMember).distinct().toList();
        return members.stream().map(user -> userMapper.toDto(user)).toList();
    }

    public boolean changePassword(String username, String newPassword) {
        User user = getUserEntity(username);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    private AgeGroup classifyAgeGroup(LocalDate dob) {
        LocalDate now = LocalDate.now();
        int age = Period.between(dob, now).getYears();
        if (age <= 17) {
            return AgeGroup.ADOLESCENT;
        } else if (age >= 18 && age <= 59) {
            return AgeGroup.ADULT;
        } else {
            return AgeGroup.SENIOR;
        }
    }
}
