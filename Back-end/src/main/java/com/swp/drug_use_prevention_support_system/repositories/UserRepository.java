package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByRole(Role role);

    List<User> findByCreatedAtBetween(Instant start, Instant end);

    List<User> findByRoleAndCreatedAtBetween(Role role, Instant start, Instant end);

    List<User> findByStatusAndRole(UserStatus status, Role role);

    List<User> findByStatus(UserStatus status);

    List<User> findByRoleNot(Role role);

    int countByRole(Role role);

    @Query(value = "SELECT COUNT(*) FROM users u WHERE MONTH(u.created_at) = :month AND YEAR(u.created_at) = :year", nativeQuery = true)
    int countUsersByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT u.ageGroup, COUNT(u) FROM User u WHERE u.ageGroup IS NOT NULL GROUP BY u.ageGroup")
    List<Object[]> countUsersByAgeGroup();
}
