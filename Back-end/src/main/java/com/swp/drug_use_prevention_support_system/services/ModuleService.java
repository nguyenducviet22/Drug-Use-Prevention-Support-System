package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.domain.model.Module;
import com.swp.drug_use_prevention_support_system.mappers.ModuleMapper;
import com.swp.drug_use_prevention_support_system.repositories.ModuleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    public ModuleResponse createProduct(CreateModuleRequest request) {
        Module module = moduleMapper.toModel(request);
        moduleRepository.save(module);
        return moduleMapper.toDto(module);
    }

    public List<ModuleResponse> getAllModulesForCourse(UUID courseID) {
        List<Module> modules = moduleRepository.findByCourseID(courseID);
        return modules.stream()
                .map(module -> moduleMapper.toDto(module))
                .toList();
    }

    public ModuleResponse getModel(String moduleID) {
        Module module = moduleRepository.findById(moduleID)
                .orElseThrow(() -> new EntityNotFoundException("Module does not exist with ID:" + moduleID));
        return moduleMapper.toDto(module);
    }
}
