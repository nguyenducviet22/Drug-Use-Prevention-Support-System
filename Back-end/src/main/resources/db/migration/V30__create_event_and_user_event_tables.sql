CREATE TABLE event (
    event_id BINARY(16) NOT NULL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    duration INT,
    quantity INT,
    description TEXT,
    img VARCHAR(255),
    status ENUM('NOT_STARTED', 'ONGOING', 'EXPIRED', 'CANCELLED') NOT NULL,
    age_group ENUM('ADOLESCENT', 'ADULT', 'SENIOR', 'EVERYONE') NOT NULL,
    started_at DATETIME(6),
    ended_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

CREATE TABLE user_event (
    event_id BINARY(16) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES event(event_id),
    FOREIGN KEY (member_id) REFERENCES users(username)
);
