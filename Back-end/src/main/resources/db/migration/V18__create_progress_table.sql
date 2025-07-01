CREATE TABLE progress (
    progress_id BINARY(16) NOT NULL PRIMARY KEY,
    lesson_id BINARY(16) NOT NULL,
    status ENUM('NOT_STARTED', 'COMPLETED') NOT NULL,
    started_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6) NOT NULL,
    enrollment_id BINARY(16) NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id)
);
