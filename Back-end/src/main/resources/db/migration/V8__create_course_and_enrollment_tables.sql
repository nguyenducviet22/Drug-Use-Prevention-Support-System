CREATE TABLE course (
    course_id BINARY(16) NOT NULL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    quantity INT,
    duration INT,
    img VARCHAR(255),
    description TEXT,
    age_group ENUM('ADOLESCENT', 'ADULT', 'SENIOR') NOT NULL,
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE enrollment (
    member_id VARCHAR(100) NOT NULL,
    course_id BINARY(16) NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    status ENUM('NOT_STARTED', 'ENROLLED', 'EXPIRED') NOT NULL,
    PRIMARY KEY (member_id, course_id),
    FOREIGN KEY (member_id) REFERENCES users(username),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
