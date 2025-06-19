CREATE TABLE enrollment (
    enrollment_id BINARY(16) NOT NULL PRIMARY KEY,
    member_id VARCHAR(100) NOT NULL,
    course_id BINARY(16) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('NOT_STARTED', 'COMPLETED', 'CANCELED', 'LEARNING', 'EXPIRED') NOT NULL,
    FOREIGN KEY (member_id) REFERENCES users(username),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    CONSTRAINT UQ_member_course UNIQUE (member_id, course_id)
);
