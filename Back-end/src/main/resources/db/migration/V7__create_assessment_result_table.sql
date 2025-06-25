CREATE TABLE assessment_result (
    assessment_result_id BINARY(16) NOT NULL PRIMARY KEY,
    score INT NOT NULL,
    suggested_action TEXT,
    completed_time DATETIME NOT NULL,
    risk_level ENUM('NORMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL') NOT NULL,
    username VARCHAR(100) NOT NULL,
    assessment_id BINARY(16) NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (assessment_id) REFERENCES assessment(assessment_id)
);
