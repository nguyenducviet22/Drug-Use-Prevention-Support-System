package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteLessonsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.mappers.LessonMapper;
import com.swp.drug_use_prevention_support_system.repositories.LessonRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonMapper lessonMapper;

    @Mock
    private ModuleService moduleService;

    @Mock
    private BlogService blogService;

    @InjectMocks
    private LessonService lessonService;

    private UUID lessonId;
    private UUID moduleId;
    private Lesson lesson;
    private Module module;
    private LessonResponse lessonResponse;

    @BeforeEach
    void setUp() {
        lessonId = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        module = Module.builder().moduleID(moduleId).build();
        lesson = Lesson.builder()
                .lessonID(lessonId)
                .lessonName("Lesson 1")
                .duration(5)
                .objective("Objective")
                .content("Some content")
                .resource("Resource")
                .status(CourseStatus.AVAILABLE)
                .module(module)
                .build();
        lessonResponse = LessonResponse.builder()
                .lessonID(lessonId)
                .lessonName("Lesson 1")
                .duration(5)
                .objective("Objective")
                .content("Some content")
                .resource("Resource")
                .status(CourseStatus.AVAILABLE)
                .module(null)
                .build();
    }

    @Test
    void testCreateLessonWithValidInput() {
        CreateLessonRequest request = CreateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Objective")
                .content("Some content")
                .resource("Resource")
                .moduleID(moduleId)
                .build();

        Lesson mappedLesson = Lesson.builder().build();

        when(lessonMapper.toEntity(request)).thenReturn(mappedLesson);
        when(blogService.calculateReadingTime("Some content")).thenReturn(7);
        when(moduleService.getModelEntity(moduleId)).thenReturn(module);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        LessonResponse result = lessonService.createLesson(request);

        assertNotNull(result);
        assertEquals("Lesson 1", result.getLessonName());
        assertEquals(5, result.getDuration());
        verify(lessonRepository).save(any(Lesson.class));
        verify(moduleService).getModelEntity(moduleId);
    }

    @Test
    void testGetLessonsForModuleAvailableStatus() {
        List<Lesson> lessons = List.of(lesson);
        when(lessonRepository.findByModuleModuleIDAndStatus(moduleId, CourseStatus.AVAILABLE)).thenReturn(lessons);
        when(lessonMapper.toDto(lesson)).thenReturn(lessonResponse);

        List<LessonResponse> responses = lessonService.getLessonsForModule(moduleId);

        assertEquals(1, responses.size());
        assertEquals(lessonId, responses.get(0).getLessonID());
        verify(lessonRepository).findByModuleModuleIDAndStatus(moduleId, CourseStatus.AVAILABLE);
    }

    @Test
    void testUpdateLessonWithValidRequest() {
        UpdateLessonRequest updateRequest = UpdateLessonRequest.builder()
                .lessonName("Updated Name")
                .objective("Updated Objective")
                .content("Updated Content")
                .resource("Updated Resource")
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(blogService.calculateReadingTime("Updated Content")).thenReturn(10);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        LessonResponse response = lessonService.updateLesson(lessonId, updateRequest);

        assertNotNull(response);
        verify(lessonRepository).save(lesson);
        assertEquals("Updated Name", lesson.getLessonName());
        assertEquals(10, lesson.getDuration());
        assertEquals("Updated Objective", lesson.getObjective());
        assertEquals("Updated Content", lesson.getContent());
    }

    @Test
    void testGetLessonEntityNotFound() {
        when(lessonRepository.findById(lessonId)).thenReturn(Optional.empty());
        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> lessonService.getLessonEntity(lessonId));
        assertTrue(ex.getMessage().contains("Lesson does not exist with ID"));
    }

    @Test
    void testUpdateLessonsStatusIgnoresNonModuleLessons() {
        UUID otherLessonId = UUID.randomUUID();
        Lesson lessonInModule = Lesson.builder().lessonID(lessonId).status(CourseStatus.AVAILABLE).build();
        Lesson lessonNotInModule = Lesson.builder().lessonID(otherLessonId).status(CourseStatus.AVAILABLE).build();

        List<Lesson> availableLessons = List.of(lessonInModule);
        List<UUID> requestedIds = List.of(lessonId, otherLessonId);

        DeleteLessonsRequest request = DeleteLessonsRequest.builder()
                .lessonIds(requestedIds)
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(lessonRepository.findByModuleModuleIDAndStatus(moduleId, CourseStatus.AVAILABLE)).thenReturn(availableLessons);
        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lessonInModule));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        List<LessonResponse> responses = lessonService.updateLessonsStatus(moduleId, request);

        assertEquals(1, responses.size());
        verify(lessonRepository, never()).findById(otherLessonId);
    }

    @Test
    void testCountLessonsByCourseIdWithNoLessons() {
        UUID courseId = UUID.randomUUID();
        when(lessonRepository.countLessonsByCourseId(courseId)).thenReturn(0);

        int count = lessonService.countLessonsByCourseId(courseId);

        assertEquals(0, count);
        verify(lessonRepository).countLessonsByCourseId(courseId);
    }

    @Test
    void testGetAllLessonsReturnsAllLessonResponses() {
        List<Lesson> lessons = List.of(lesson);
        when(lessonRepository.findAll()).thenReturn(lessons);
        when(lessonMapper.toDto(lesson)).thenReturn(lessonResponse);

        List<LessonResponse> responses = lessonService.getLessons();

        assertEquals(1, responses.size());
        assertEquals(lessonId, responses.get(0).getLessonID());
        verify(lessonRepository).findAll();
    }

    @Test
    void testUpdateLessonEntityNotFound() {
        UpdateLessonRequest updateRequest = UpdateLessonRequest.builder()
                .lessonName("Name")
                .objective("Objective")
                .content("Content")
                .resource("Resource")
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> lessonService.updateLesson(lessonId, updateRequest));
    }

    @Test
    void testBulkUpdateLessonsStatusSuccess() {
        Lesson lesson1 = Lesson.builder().lessonID(UUID.randomUUID()).status(CourseStatus.AVAILABLE).build();
        Lesson lesson2 = Lesson.builder().lessonID(UUID.randomUUID()).status(CourseStatus.AVAILABLE).build();
        List<Lesson> availableLessons = List.of(lesson1, lesson2);
        List<UUID> requestedIds = List.of(lesson1.getLessonID(), lesson2.getLessonID());

        DeleteLessonsRequest request = DeleteLessonsRequest.builder()
                .lessonIds(requestedIds)
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(lessonRepository.findByModuleModuleIDAndStatus(moduleId, CourseStatus.AVAILABLE)).thenReturn(availableLessons);
        when(lessonRepository.findById(lesson1.getLessonID())).thenReturn(Optional.of(lesson1));
        when(lessonRepository.findById(lesson2.getLessonID())).thenReturn(Optional.of(lesson2));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        List<LessonResponse> responses = lessonService.updateLessonsStatus(moduleId, request);

        assertEquals(2, responses.size());
        assertEquals(CourseStatus.UNAVAILABLE, lesson1.getStatus());
        assertEquals(CourseStatus.UNAVAILABLE, lesson2.getStatus());
    }

    @Test
    void testLessonDurationCalculationOnCreateOrUpdate() {
        CreateLessonRequest createRequest = CreateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Objective")
                .content("This is a test content for duration calculation.")
                .resource("Resource")
                .moduleID(moduleId)
                .build();

        Lesson mappedLesson = Lesson.builder().build();

        when(lessonMapper.toEntity(createRequest)).thenReturn(mappedLesson);
        when(blogService.calculateReadingTime("This is a test content for duration calculation.")).thenReturn(3);
        when(moduleService.getModelEntity(moduleId)).thenReturn(module);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        LessonResponse response = lessonService.createLesson(createRequest);

        assertEquals(3, mappedLesson.getDuration());

        UpdateLessonRequest updateRequest = UpdateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Objective")
                .content("Another content for update duration.")
                .resource("Resource")
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(blogService.calculateReadingTime("Another content for update duration.")).thenReturn(2);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        lessonService.updateLesson(lessonId, updateRequest);

        assertEquals(2, lesson.getDuration());
    }

    @Test
    void testCalculateDurationWithNullOrEmptyContent() {
        CreateLessonRequest nullContentRequest = CreateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Objective")
                .content(null)
                .resource("Resource")
                .moduleID(moduleId)
                .build();

        Lesson mappedLesson = Lesson.builder().build();

        when(lessonMapper.toEntity(nullContentRequest)).thenReturn(mappedLesson);
        when(blogService.calculateReadingTime(null)).thenReturn(0);
        when(moduleService.getModelEntity(moduleId)).thenReturn(module);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        LessonResponse responseNull = lessonService.createLesson(nullContentRequest);
        assertEquals(0, mappedLesson.getDuration());

        CreateLessonRequest emptyContentRequest = CreateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Objective")
                .content("")
                .resource("Resource")
                .moduleID(moduleId)
                .build();

        Lesson mappedLesson2 = Lesson.builder().build();

        when(lessonMapper.toEntity(emptyContentRequest)).thenReturn(mappedLesson2);
        when(blogService.calculateReadingTime("")).thenReturn(0);

        LessonResponse responseEmpty = lessonService.createLesson(emptyContentRequest);
        assertEquals(0, mappedLesson2.getDuration());
    }

    @Test
    void testPartialUpdateLessonFieldsRemainUnchanged() {
        Lesson originalLesson = Lesson.builder()
                .lessonID(lessonId)
                .lessonName("Original Name")
                .duration(5)
                .objective("Original Objective")
                .content("Original Content")
                .resource("Original Resource")
                .status(CourseStatus.AVAILABLE)
                .module(module)
                .build();

        UpdateLessonRequest updateRequest = UpdateLessonRequest.builder()
                .lessonName("Updated Name")
                .objective("Updated Objective")
                .content("Updated Content")
                .resource("Updated Resource")
                .build();

        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(originalLesson));
        when(blogService.calculateReadingTime("Updated Content")).thenReturn(8);
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(lessonMapper.toDto(any(Lesson.class))).thenReturn(lessonResponse);

        lessonService.updateLesson(lessonId, updateRequest);

        assertEquals("Updated Name", originalLesson.getLessonName());
        assertEquals("Updated Objective", originalLesson.getObjective());
        assertEquals("Updated Content", originalLesson.getContent());
        assertEquals("Original Resource", originalLesson.getResource()); // Should remain unchanged if not set in request
        assertEquals(8, originalLesson.getDuration());
    }

    @Test
    void testCreateLessonWithNonExistentModuleId() {
        CreateLessonRequest request = CreateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Objective")
                .content("Some content")
                .resource("Resource")
                .moduleID(moduleId)
                .build();

        Lesson mappedLesson = Lesson.builder().build();

        when(lessonMapper.toEntity(request)).thenReturn(mappedLesson);
        when(blogService.calculateReadingTime("Some content")).thenReturn(7);
        when(moduleService.getModelEntity(moduleId)).thenThrow(new EntityNotFoundException("Module does not exist"));

        assertThrows(EntityNotFoundException.class, () -> lessonService.createLesson(request));
    }

    @Test
    void testBulkUpdateLessonsStatusWithEmptyLessonIds() {
        List<Lesson> availableLessons = List.of();
        DeleteLessonsRequest request = DeleteLessonsRequest.builder()
                .lessonIds(Collections.emptyList())
                .status(CourseStatus.UNAVAILABLE)
                .build();

        when(lessonRepository.findByModuleModuleIDAndStatus(moduleId, CourseStatus.AVAILABLE)).thenReturn(availableLessons);

        List<LessonResponse> responses = lessonService.updateLessonsStatus(moduleId, request);

        assertTrue(responses.isEmpty());
        verify(lessonRepository, never()).findById(any());
        verify(lessonRepository, never()).save(any());
    }

    @Test
    void testUpdateLessonWithInvalidUUID() {
        String invalidUUID = "not-a-uuid";
        UpdateLessonRequest updateRequest = UpdateLessonRequest.builder()
                .lessonName("Name")
                .objective("Objective")
                .content("Content")
                .resource("Resource")
                .build();

        assertThrows(IllegalArgumentException.class, () -> {
            UUID uuid = UUID.fromString(invalidUUID);
            lessonService.updateLesson(uuid, updateRequest);
        });
    }
}