CREATE TABLE module (
    module_id BINARY(16) NOT NULL PRIMARY KEY,
    module_name VARCHAR(255),
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    course_id BINARY(16) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
