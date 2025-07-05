package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteModulesRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.mappers.ModuleMapper;
import com.swp.drug_use_prevention_support_system.repositories.ModuleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;
    private final CourseService courseService;

    public ModuleResponse createModule(CreateModuleRequest request) {
        Module module = moduleMapper.toModel(request);
        module.setModuleID(UUID.randomUUID());
        module.setStatus(CourseStatus.AVAILABLE);
        UUID courseID = request.getCourseID();
        Course course = courseService.getCourseEntity(courseID);
        module.setCourse(course);
        moduleRepository.save(module);
        return moduleMapper.toDto(module);
    }

    public List<ModuleResponse> getAllModulesForCourse(UUID courseID) {
        List<Module> modules = getAllModulesByCourseID(courseID, CourseStatus.AVAILABLE);
        return modules.stream()
                .map(module -> moduleMapper.toDto(module))
                .toList();
    }

    public List<Module> getAllModulesByCourseID(UUID courseID, CourseStatus status) {
        return moduleRepository.findByCourseCourseIDAndStatus(courseID, status);
    }

    public Module getModelEntity(UUID moduleID) {
        return moduleRepository.findById(moduleID)
                .orElseThrow(() -> new EntityNotFoundException("Module does not exist with ID:" + moduleID));
    }

    public ModuleResponse getModel(UUID moduleID) {
        Module module = getModelEntity(moduleID);
        return moduleMapper.toDto(module);
    }

    public ModuleResponse updateModule(UUID moduleID, UpdateModuleRequest request) {
        Module module = getModelEntity(moduleID);
        module.setModuleName(request.getModuleName());
        moduleRepository.save(module);
        return moduleMapper.toDto(module);
    }

    public List<ModuleResponse> updateModulesStatus(UUID courseID, DeleteModulesRequest request) {
        List<UUID> existingModuleIDs = getAllModulesByCourseID(courseID, CourseStatus.AVAILABLE).stream()
                .map(Module::getModuleID).toList();
        List<UUID> requestedModuleIDs = request.getModuleIds();
        List<Module> modules = new ArrayList<>();
        for (UUID id : requestedModuleIDs) {
            if (existingModuleIDs.contains(id)) {
                Module module = getModelEntity(id);
                module.setStatus(request.getStatus());
                moduleRepository.save(module);
                modules.add(module);
            }
        }
        return modules.stream().map(module -> moduleMapper.toDto(module)).toList();
    }
}
