CREATE TABLE users (
    username VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    dob DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    phone_number VARCHAR(20) UNIQUE,
    job VARCHAR(255),
    role ENUM('MEMBER', 'STAFF', 'CONSULTANT', 'MANAGER', 'ADMIN'),
    address VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL
);
