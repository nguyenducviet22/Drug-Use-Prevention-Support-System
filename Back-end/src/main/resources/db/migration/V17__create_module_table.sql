CREATE TABLE module (
    module_id BINARY(16) NOT NULL PRIMARY KEY,
    module_name VARCHAR(255),
    course_id BINARY(16) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
