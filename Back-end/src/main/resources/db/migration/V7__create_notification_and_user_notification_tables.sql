CREATE TABLE notification (
    notification_id BINARY(16) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('SENT', 'READ', 'UNREAD', 'FAILED') NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE user_notification (
    username VARCHAR(255) NOT NULL,
    notification_id BINARY(16) NOT NULL,
    PRIMARY KEY (username, notification_id),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (notification_id) REFERENCES notification(notification_id)
);
