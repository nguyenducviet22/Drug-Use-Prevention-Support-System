CREATE TABLE lesson (
    lesson_id BINARY(16) NOT NULL PRIMARY KEY,
    lesson_name VARCHAR(255),
    duration INT,
    objective TEXT,
    content TEXT,
    resource TEXT,
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    module_id BINARY(16) NOT NULL,
    FOREIGN KEY (module_id) REFERENCES module(module_id)
);
