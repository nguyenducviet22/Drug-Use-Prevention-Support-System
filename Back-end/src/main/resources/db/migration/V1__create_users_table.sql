CREATE TABLE users (
    username VARCHAR(100) NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    dob DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    phone_number VARCHAR(20),
    job VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    role ENUM('MEMBER', 'STAFF', 'CONSULTANT', 'MANAGER', 'ADMIN') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL
);
