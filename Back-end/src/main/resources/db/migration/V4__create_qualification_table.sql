CREATE TABLE qualification (
    qualification_id BINARY(16) NOT NULL PRIMARY KEY,
    img VARCHAR(255) NOT NULL,
    degree ENUM('ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORAL', 'CERTIFICATION') NOT NULL,
    institution VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    consultant_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (consultant_id) REFERENCES users(username)
);
