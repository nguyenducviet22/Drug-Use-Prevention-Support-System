package com.swp.drug_use_prevention_support_system.domain.model;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(value = "lessons")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Lesson {

    @Id
    String lessonID;
    String moduleID;
    String lessonName;
    String lessonTitle;
    int lessonDuration;
    AgeGroup lessonAgeGroup;
    String lessonLevel;
    List<String> lessonObjectives;
    List<LessonContent> lessonContent;
    double lessonProgress;
    LocalDateTime lessonCreatedAt;
    LocalDateTime lessonUpdatedAt;
}
