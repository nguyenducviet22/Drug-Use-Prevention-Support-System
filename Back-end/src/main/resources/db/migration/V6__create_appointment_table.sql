CREATE TABLE appointment (
    appointment_id BINARY(16) NOT NULL PRIMARY KEY,
    notes TEXT,
    status ENUM('SCHEDULED', 'RESCHEDULED', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL,
    created_at DATETIME NOT NULL,
    appointment_date_time DATETIME NOT NULL,
    member_id VARCHAR(255) NOT NULL,
    consultant_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (member_id) REFERENCES users(username),
    FOREIGN KEY (consultant_id) REFERENCES users(username)
);
