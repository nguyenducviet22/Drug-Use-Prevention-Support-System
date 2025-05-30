package com.swp.drug_use_prevention_support_system.validators;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, CreateUserRequest> {

    @Override
    public boolean isValid(CreateUserRequest request, ConstraintValidatorContext context) {
        if (request.getPassword() == null || request.getConfirm() == null) return true;
        return request.getPassword().equals(request.getConfirm());
    }
}
