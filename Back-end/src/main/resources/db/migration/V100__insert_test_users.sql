-- Delete existing users with same username or email
DELETE FROM users
WHERE username IN ('kiet_member', 'kiet_manager')
   OR email IN ('kiet@example.com', 'kietle@example.com');

-- Insert new users
INSERT INTO users (
    username, password, email, full_name, dob, gender, phone_number, job, role, address, created_at, updated_at, status
) VALUES
('kiet_member', '$2y$04$87WuyPlKu1v2UT2V9b789ul.7c/9c9eTbmJTpnVpaMeEFD1MdUFRu', 'kiet@example.com', 'kiet le', '1990-01-01', 'MALE', '0862886128', 'Engineer', 'MEMBER', '123 Main St', NOW(), NOW(), 'ACTIVE'),
('kiet_manager', '$2y$04$87WuyPlKu1v2UT2V9b789ul.7c/9c9eTbmJTpnVpaMeEFD1MdUFRu', 'kietle@example.com', 'tuan kiet', '1990-01-01', 'MALE', '0933259000', 'Engineer', 'MANAGER', '123 Main St', NOW(), NOW(), 'ACTIVE');
