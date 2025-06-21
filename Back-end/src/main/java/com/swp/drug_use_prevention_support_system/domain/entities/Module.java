package com.swp.drug_use_prevention_support_system.domain.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Module {

    @Id
    @Column(name = "module_id")
    UUID moduleID;
    String moduleName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    Course course;

    @OneToMany(mappedBy = "module")
    List<Lesson> lessons = new ArrayList<>();
}
