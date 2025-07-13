CREATE TABLE availability (
    availability_id BINARY(16) NOT NULL PRIMARY KEY,
    status ENUM('SCHEDULED', 'RESCHEDULED', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL,
    availability_date_time DATETIME(6) NOT NULL,
    reason TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    consultant_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (consultant_id) REFERENCES users(username),
    CONSTRAINT unique_availability_date_consultant UNIQUE (availability_date_time, consultant_id)
);
