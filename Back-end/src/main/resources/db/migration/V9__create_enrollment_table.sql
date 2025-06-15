CREATE TABLE enrollment (
    enrollment_id BINARY(16) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    course_id BINARY(16) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('NOT_STARTED', 'COMPLETED', 'CANCELED', 'LEARNING', 'EXPIRED') NOT NULL,
    PRIMARY KEY (enrollment_id, member_id, course_id),
    FOREIGN KEY (member_id) REFERENCES users(username),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
