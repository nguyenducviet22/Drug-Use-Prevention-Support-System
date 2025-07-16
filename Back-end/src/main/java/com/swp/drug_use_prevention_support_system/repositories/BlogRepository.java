package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Blog;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    List<Blog> findByMemberUsernameAndBlogStatusOrderByCreatedAtDesc(String username, BlogStatus blogStatus);

    List<Blog> findByBlogStatusOrderByCreatedAtDesc(BlogStatus status);

    List<Blog> findByBlogStatusAndCreatedAtBetween(BlogStatus status, Instant start, Instant end);

    List<Blog> findByAgeGroupAndBlogStatusOrderByCreatedAtDesc(AgeGroup ageGroup, BlogStatus blogStatus);

    List<Blog> findByMemberRoleOrderByCreatedAtDesc(Role role);
}
