INSERT INTO user_details (detail_id, full_name, phone_number, relationship, address, status, created_at, updated_at, member_id)
VALUES
(UNHEX(REPLACE(UUID(), '-', '')), 'Alice Member', '012-345-6785', 'Spouse', '123 Elm St', 'ACTIVE', NOW(), NOW(), 'john_member'),
(UNHEX(REPLACE(UUID(), '-', '')), 'Bob Staff', '012-345-6786', 'Sibling', '456 Oak St', 'ACTIVE', NOW(), NOW(), 'john_member'),
(UNHEX(REPLACE(UUID(), '-', '')), 'Charlie Consultant', '012-345-6787', 'Friend', '789 Pine St', 'INACTIVE', NOW(), NOW(), 'david_member'),
(UNHEX(REPLACE(UUID(), '-', '')), 'Dana Manager', '012-345-6788', 'Parent', '321 Cedar St', 'ACTIVE', NOW(), NOW(), 'david_member');
