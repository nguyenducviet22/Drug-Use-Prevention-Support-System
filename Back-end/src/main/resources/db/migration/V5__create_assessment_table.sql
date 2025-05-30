CREATE TABLE assessment (
    assessment_id BINARY(16) NOT NULL PRIMARY KEY,
    img VARCHAR(255),
    risk_level ENUM('NORMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL') NOT NULL,
    score INT NOT NULL,
    assessment_type VARCHAR(255) NOT NULL,
    suggested_action TEXT,
    created_at DATETIME NOT NULL,
    username VARCHAR(100) NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);
