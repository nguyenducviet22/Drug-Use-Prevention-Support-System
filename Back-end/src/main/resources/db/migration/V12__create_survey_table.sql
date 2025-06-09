CREATE TABLE survey (
    survey_id BINARY(16) NOT NULL PRIMARY KEY,
    type ENUM('PRE_EVENT', 'POST_EVENT') NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'CLOSED') NOT NULL,
    feedback TEXT,
    description TEXT,
    survey_date DATETIME NOT NULL,
    event_id BINARY(16),
    FOREIGN KEY (event_id) REFERENCES event(event_id)
);
