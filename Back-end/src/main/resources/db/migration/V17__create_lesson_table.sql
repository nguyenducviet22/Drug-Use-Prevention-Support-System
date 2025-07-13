CREATE TABLE lesson (
    lesson_id BINARY(16) NOT NULL PRIMARY KEY,
    lesson_name VARCHAR(255),
    duration INT NOT NULL,
    objective TEXT NOT NULL,
    content TEXT NOT NULL,
    resource TEXT NOT NULL,
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    module_id BINARY(16) NOT NULL,
    FOREIGN KEY (module_id) REFERENCES module(module_id)
);
