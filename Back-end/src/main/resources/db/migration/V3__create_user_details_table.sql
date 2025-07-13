CREATE TABLE user_details (
    detail_id BINARY(16) NOT NULL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    relationship VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    member_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (member_id) REFERENCES users(username)
);
