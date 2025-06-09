package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CourseResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    Course toEntity(CreateCourseRequest request);
    Course toEntity(UpdateCourseRequest request);
    Course toEntity(CourseResponse response);
    CourseResponse toDto(Course course);
}
