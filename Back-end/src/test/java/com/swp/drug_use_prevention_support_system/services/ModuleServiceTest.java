package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteModulesRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.mappers.ModuleMapper;
import com.swp.drug_use_prevention_support_system.repositories.CourseRepository;
import com.swp.drug_use_prevention_support_system.repositories.ModuleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModuleServiceTest {

    @Mock
    private ModuleRepository moduleRepository;
    @Mock
    private ModuleMapper moduleMapper;
    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private ModuleService moduleService;

    @Captor
    private ArgumentCaptor<Module> moduleCaptor;

    private UUID courseId;
    private UUID moduleId;
    private Course course;
    private Module module;
    private ModuleResponse moduleResponse;

    @BeforeEach
    void setUp() {
        courseId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        course = Course.builder().courseID(courseId).build();
        module = Module.builder().moduleID(moduleId).moduleName("Test Module").status(CourseStatus.AVAILABLE).course(course).build();
        moduleResponse = ModuleResponse.builder().moduleID(moduleId).moduleName("Test Module").status(CourseStatus.AVAILABLE).build();
    }

    @Test
    void testCreateModuleWithValidRequest() {
        CreateModuleRequest request = CreateModuleRequest.builder().moduleName("New Module").courseID(courseId).build();
        Module mappedModule = Module.builder().moduleName("New Module").build();

        when(moduleMapper.toModel(request)).thenReturn(mappedModule);
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(moduleRepository.save(any(Module.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(moduleMapper.toDto(any(Module.class))).thenReturn(moduleResponse);

        ModuleResponse response = moduleService.createModule(request);

        assertNotNull(response);
        assertEquals("Test Module", response.getModuleName());
        verify(moduleRepository).save(moduleCaptor.capture());
        assertEquals(CourseStatus.AVAILABLE, moduleCaptor.getValue().getStatus());
        assertEquals(course, moduleCaptor.getValue().getCourse());
    }

    @Test
    void testGetAllModulesForCourseReturnsAvailableModules() {
        List<Module> modules = List.of(module);
        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(modules);
        when(moduleMapper.toDto(module)).thenReturn(moduleResponse);

        List<ModuleResponse> responses = moduleService.getAllModulesForCourse(courseId);

        assertEquals(1, responses.size());
        assertEquals(moduleResponse, responses.get(0));
    }

    @Test
    void testUpdateModuleWithValidRequest() {
        UpdateModuleRequest request = UpdateModuleRequest.builder().moduleName("Updated Name").build();
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(moduleRepository.save(any(Module.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(moduleMapper.toDto(any(Module.class))).thenReturn(moduleResponse);

        ModuleResponse response = moduleService.updateModule(moduleId, request);

        assertNotNull(response);
        verify(moduleRepository).save(moduleCaptor.capture());
        assertEquals("Updated Name", moduleCaptor.getValue().getModuleName());
    }

    @Test
    void testCreateModuleWithNonExistentCourseThrowsException() {
        CreateModuleRequest request = CreateModuleRequest.builder().moduleName("New Module").courseID(courseId).build();
        Module mappedModule = Module.builder().moduleName("New Module").build();

        when(moduleMapper.toModel(request)).thenReturn(mappedModule);
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> moduleService.createModule(request));
        assertTrue(ex.getMessage().contains("Course does not exist with ID"));
    }

    @Test
    void testGetModelEntityWithNonExistentModuleThrowsException() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> moduleService.getModelEntity(moduleId));
        assertTrue(ex.getMessage().contains("Module does not exist with ID"));
    }

    @Test
    void testUpdateModulesStatusSkipsNonAvailableModules() {
        UUID availableModuleId = UUID.randomUUID();
        UUID unavailableModuleId = UUID.randomUUID();
        Module availableModule = Module.builder().moduleID(availableModuleId).status(CourseStatus.AVAILABLE).build();
        Module unavailableModule = Module.builder().moduleID(unavailableModuleId).status(CourseStatus.UNAVAILABLE).build();

        List<Module> availableModules = List.of(availableModule);
        List<UUID> requestedIds = List.of(availableModuleId, unavailableModuleId);

        DeleteModulesRequest request = DeleteModulesRequest.builder()
                .moduleIds(requestedIds)
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(availableModules);
        when(moduleRepository.findById(availableModuleId)).thenReturn(Optional.of(availableModule));
        when(moduleMapper.toDto(any(Module.class))).thenReturn(moduleResponse);

        List<ModuleResponse> responses = moduleService.updateModulesStatus(courseId, request);

        assertEquals(1, responses.size());
        verify(moduleRepository, times(1)).save(availableModule);
        verify(moduleRepository, never()).save(unavailableModule);
    }

    @Test
    void testUpdateModulesStatusWithValidModuleIds() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        Module m1 = Module.builder().moduleID(id1).status(CourseStatus.AVAILABLE).build();
        Module m2 = Module.builder().moduleID(id2).status(CourseStatus.AVAILABLE).build();

        List<Module> availableModules = List.of(m1, m2);
        List<UUID> requestedIds = List.of(id1, id2);

        DeleteModulesRequest request = DeleteModulesRequest.builder()
                .moduleIds(requestedIds)
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(availableModules);
        when(moduleRepository.findById(id1)).thenReturn(Optional.of(m1));
        when(moduleRepository.findById(id2)).thenReturn(Optional.of(m2));
        when(moduleMapper.toDto(m1)).thenReturn(moduleResponse);
        when(moduleMapper.toDto(m2)).thenReturn(moduleResponse);

        List<ModuleResponse> responses = moduleService.updateModulesStatus(courseId, request);

        assertEquals(2, responses.size());
        verify(moduleRepository).save(m1);
        verify(moduleRepository).save(m2);
    }

    @Test
    void testUpdateModulesStatusWithInvalidModuleIdsReturnsEmptyList() {
        List<Module> availableModules = List.of(module);
        List<UUID> requestedIds = List.of(UUID.randomUUID(), UUID.randomUUID());

        DeleteModulesRequest request = DeleteModulesRequest.builder()
                .moduleIds(requestedIds)
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(availableModules);

        List<ModuleResponse> responses = moduleService.updateModulesStatus(courseId, request);

        assertTrue(responses.isEmpty());
        verify(moduleRepository, never()).save(any());
    }

    @Test
    void testGetModelReturnsModuleResponseForExistingModule() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(moduleMapper.toDto(module)).thenReturn(moduleResponse);

        ModuleResponse response = moduleService.getModel(moduleId);

        assertNotNull(response);
        assertEquals(moduleResponse, response);
    }

    @Test
    void testUpdateModuleWithNonExistentModuleThrowsException() {
        UpdateModuleRequest request = UpdateModuleRequest.builder().moduleName("Updated Name").build();
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> moduleService.updateModule(moduleId, request));
        assertTrue(ex.getMessage().contains("Module does not exist with ID"));
    }

    @Test
    void testGetAllModulesForCourseReturnsEmptyListWhenNoAvailableModules() {
        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        List<ModuleResponse> responses = moduleService.getAllModulesForCourse(courseId);

        assertTrue(responses.isEmpty());
    }

    @Test
    void testUpdateModulesStatusWithNonExistentModuleThrowsException() {
        UUID validId = UUID.randomUUID();
        List<Module> availableModules = List.of(Module.builder().moduleID(validId).status(CourseStatus.AVAILABLE).build());
        List<UUID> requestedIds = List.of(validId);

        DeleteModulesRequest request = DeleteModulesRequest.builder()
                .moduleIds(requestedIds)
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(availableModules);
        when(moduleRepository.findById(validId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> moduleService.updateModulesStatus(courseId, request));
    }

    @Test
    void testModuleEntityIsMappedToModuleResponse() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(moduleMapper.toDto(module)).thenReturn(moduleResponse);

        ModuleResponse response = moduleService.getModel(moduleId);

        assertNotNull(response);
        assertEquals(moduleResponse, response);
        verify(moduleMapper).toDto(module);
    }

    @Test
    void testUpdateModulesStatusWithEmptyModuleIds() {
        List<Module> availableModules = List.of(module);
        DeleteModulesRequest request = DeleteModulesRequest.builder()
                .moduleIds(Collections.emptyList())
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(availableModules);

        List<ModuleResponse> responses = moduleService.updateModulesStatus(courseId, request);

        assertTrue(responses.isEmpty());
        verify(moduleRepository, never()).save(any());
    }

    @Test
    void testGetAllModulesByCourseIDWithCustomStatus() {
        List<Module> modules = List.of(module);
        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.PENDING)).thenReturn(modules);

        List<Module> result = moduleService.getAllModulesByCourseID(courseId, CourseStatus.PENDING);

        assertEquals(modules, result);
    }

    @Test
    void testGetAllModulesByCourseIDWithNonExistentCourseReturnsEmptyList() {
        when(moduleRepository.findByCourseCourseIDAndStatus(courseId, CourseStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        List<Module> result = moduleService.getAllModulesByCourseID(courseId, CourseStatus.AVAILABLE);

        assertTrue(result.isEmpty());
    }
}