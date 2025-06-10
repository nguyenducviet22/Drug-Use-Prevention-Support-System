CREATE TABLE password (
    password_id BINARY(16) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(255) NOT NULL,
    expiry_time DATETIME NOT NULL
);
