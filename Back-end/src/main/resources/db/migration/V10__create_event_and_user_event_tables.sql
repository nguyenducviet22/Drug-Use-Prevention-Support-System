CREATE TABLE event (
    event_id BINARY(16) NOT NULL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    duration INT,
    quantity INT,
    description TEXT,
    img VARCHAR(255),
    status ENUM('NOT_STARTED', 'ONGOING', 'EXPIRED', 'CANCELLED') NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE user_event (
    event_id BINARY(16) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES event(event_id),
    FOREIGN KEY (member_id) REFERENCES users(username)
);
