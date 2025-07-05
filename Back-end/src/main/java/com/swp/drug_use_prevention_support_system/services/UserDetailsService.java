package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserDetailsResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.entities.UserDetails;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.mappers.UserDetailsMapper;
import com.swp.drug_use_prevention_support_system.repositories.UserDetailsRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDetailsService {

    private final UserDetailsRepository userDetailsRepository;
    private final UserDetailsMapper userDetailsMapper;
    private final UserService userService;

    @PostAuthorize("returnObject.member.username == authentication.name")
    public UserDetailsResponse createUserDetails(CreateUserDetailsRequest request) {
        UserDetails userDetails = userDetailsMapper.toEntity(request);
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        userDetails.setMember(loginUser);
        userDetails.setStatus(UserStatus.ACTIVE);
        userDetailsRepository.save(userDetails);
        return userDetailsMapper.toDto(userDetails);
    }

    @PreAuthorize("hasRole('STAFF')")
    public List<UserDetailsResponse> getAllUserDetails() {
        List<UserDetails> userDetailsList = userDetailsRepository.findAll();
        return userDetailsList.stream()
                .map(userDetails -> userDetailsMapper.toDto(userDetails))
                .toList();
    }

    public List<UserDetailsResponse> getMemberUserDetails(String username) {
        List<UserDetails> userDetailsList = userDetailsRepository.findByMemberUsernameAndStatus(username, UserStatus.ACTIVE);
        return userDetailsList.stream()
                .map(userDetails -> userDetailsMapper.toDto(userDetails))
                .toList();
    }

    @PostAuthorize("returnObject.member.username == authentication.name || hasAnyRole('CONSULTANT', 'STAFF')")
    public UserDetailsResponse getUserDetails(UUID detailID) {
        UserDetails details = userDetailsRepository.findById(detailID)
                .orElseThrow(() -> new EntityNotFoundException("UserDetails does not exist with ID: " + detailID));
        return userDetailsMapper.toDto(details);
    }

    @PostAuthorize("returnObject.member.username == authentication.name")
    public UserDetailsResponse updateUserDetails(UUID detailID, UpdateUserDetailsRequest request) {
        UserDetails userDetails = userDetailsMapper.toEntity(getUserDetails(detailID));
        userDetails.setFullName(request.getFullName());
        userDetails.setPhoneNumber(request.getPhoneNumber());
        userDetails.setRelationship(request.getRelationship());
        userDetails.setAddress(request.getAddress());
        userDetailsRepository.save(userDetails);
        return userDetailsMapper.toDto(userDetails);
    }

    @PostAuthorize("returnObject.member.username == authentication.name")
    public UserDetailsResponse deleteUserDetails(UUID detailID) {
        UserDetails userDetails = userDetailsMapper.toEntity(getUserDetails(detailID));
        userDetails.setStatus(UserStatus.INACTIVE);
        userDetailsRepository.save(userDetails);
        return userDetailsMapper.toDto(userDetails);
    }
}
