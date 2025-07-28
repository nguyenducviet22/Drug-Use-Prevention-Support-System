CREATE TABLE survey (
    survey_id BINARY(16) NOT NULL PRIMARY KEY,
    type ENUM('PRE_EVENT', 'POST_EVENT') NOT NULL,
    form_link VARCHAR(512),
    event_id BINARY(16),
    FOREIGN KEY (event_id) REFERENCES event(event_id)
);
