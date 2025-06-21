CREATE TABLE event (
    event_id BINARY(16) NOT NULL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    sub_title VARCHAR(255),
    duration INT,
    quantity INT,
    description TEXT,
    img VARCHAR(255),
    status ENUM('NOT_STARTED', 'ONGOING', 'EXPIRED', 'CANCELLED') NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    age_group ENUM('ADOLESCENT', 'ADULT', 'SENIOR') NOT NULL,
    created_by_staff VARCHAR(100),
    location VARCHAR(255),
    fee DOUBLE,
    details TEXT,
    FOREIGN KEY (created_by_staff) REFERENCES users(username)
);


CREATE TABLE user_event (
    event_id BINARY(16) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES event(event_id),
    FOREIGN KEY (member_id) REFERENCES users(username)
);
