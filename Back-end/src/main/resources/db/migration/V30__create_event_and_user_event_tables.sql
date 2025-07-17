CREATE TABLE event (
    event_id BINARY(16) NOT NULL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    sub_title VARCHAR(255),
    duration INT,
    quantity INT,
    description TEXT,
    image TEXT,
    status ENUM('NOT_STARTED', 'ONGOING', 'EXPIRED', 'CANCELLED', 'DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'APPROVED') NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    age_group ENUM('ADOLESCENT', 'ADULT', 'SENIOR', 'EVERYONE'),
    created_by_staff VARCHAR(100) NOT NULL,
    approved_by_manager VARCHAR(100), -- Thêm dòng này để lưu Manager duyệt sự kiện
    location VARCHAR(255),
    fee DOUBLE,
    details TEXT,
    FOREIGN KEY (created_by_staff) REFERENCES users(username),
    FOREIGN KEY (approved_by_manager) REFERENCES users(username) -- Thêm khóa ngoại
);


CREATE TABLE user_event (
    event_id BINARY(16) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    join_at DATETIME NOT NULL,
    status ENUM('REGISTERED', 'CANCELLED', 'NOT_REGISTERED') NOT NULL,
    PRIMARY KEY (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES event(event_id),
    FOREIGN KEY (member_id) REFERENCES users(username)
);
