CREATE TABLE qualification (
    qualification_id BINARY(16) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    degree ENUM('ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORAL', 'CERTIFICATION') NOT NULL,
    institution VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    status ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    consultant_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (consultant_id) REFERENCES users(username)
);
