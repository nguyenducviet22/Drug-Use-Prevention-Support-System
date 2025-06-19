CREATE TABLE progress (
    progress_id BINARY(16) NOT NULL PRIMARY KEY,
    lesson_id BINARY(16),
    status ENUM('NOT_STARTED', 'COMPLETED'),
    completed_at DATETIME,
    last_accessed_at DATETIME,
    enrollment_id BINARY(16),
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id)
);
