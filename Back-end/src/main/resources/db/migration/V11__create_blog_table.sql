CREATE TABLE blog (
    blog_id BINARY(16) NOT NULL PRIMARY KEY,
    blog_name VARCHAR(255) NOT NULL,
    rate INT,
    img VARCHAR(255),
    description TEXT  NOT NULL,
    content TEXT NOT NULL,
    reading_time INT NOT NULL,
    blog_type ENUM('PERSONAL', 'NICHE', 'NEWS', 'EDUCATIONAL', 'GENERAL') NOT NULL,
    blog_status ENUM('DRAFT', 'PUBLISHED', 'PENDING', 'UNAVAILABLE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (member_id) REFERENCES users(username)
);
