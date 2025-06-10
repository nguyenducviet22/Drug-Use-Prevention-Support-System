CREATE TABLE assessment (
    assessment_id BINARY(16) NOT NULL PRIMARY KEY,
    img VARCHAR(255),
    assessment_type VARCHAR(255) NOT NULL,
    link_test VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);
