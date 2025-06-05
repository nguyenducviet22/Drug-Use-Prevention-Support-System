package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.mappers.UserMapper;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
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
        user.setDob(request.getDob());
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
}
