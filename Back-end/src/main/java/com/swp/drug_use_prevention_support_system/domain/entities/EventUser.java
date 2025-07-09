package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.EventUserStatus;
import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_event")
@IdClass(EventUserId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventUser {
    @Id
    @Column(name = "event_id", columnDefinition = "BINARY(16)")
    private UUID eventId;

    @Id
    @Column(name = "member_id")
    private String memberId;

    @Column(name = "join_at")
    private LocalDateTime joinAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EventUserStatus status;

    @PrePersist
    public void prePersist() {
        if (joinAt == null) {
            joinAt = LocalDateTime.now();
        }
    }
}
