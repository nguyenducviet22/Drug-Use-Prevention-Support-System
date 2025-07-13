package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    @Query("SELECT COUNT(l) FROM Lesson l JOIN l.module m JOIN m.course c WHERE c.id = :courseID")
    int countLessonsByCourseId(UUID courseID);

    List<Lesson> findByModuleModuleIDAndStatus(UUID moduleID, CourseStatus status);
}
