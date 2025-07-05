CREATE TABLE course (
    course_id BINARY(16) NOT NULL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    quantity INT,
    duration INT,
    img VARCHAR(255),
    description TEXT,
    age_group ENUM('ADOLESCENT', 'ADULT', 'SENIOR', 'EVERYONE') NOT NULL,
    status ENUM('PENDING', 'AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);