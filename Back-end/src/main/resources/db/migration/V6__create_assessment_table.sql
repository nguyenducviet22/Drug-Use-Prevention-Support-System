CREATE TABLE assessment (
    assessment_id BINARY(16) NOT NULL PRIMARY KEY,
    image VARCHAR(255),
    assessment_type ENUM('ASSIST', 'CRAFFT') NOT NULL,
    link_test VARCHAR(255),
    description VARCHAR(255) NOT NULL,
    details VARCHAR(255) NOT NULL,
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);
