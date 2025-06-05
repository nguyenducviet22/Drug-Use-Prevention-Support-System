INSERT INTO blog (blog_id, blog_name, rate, img, description, blog_type, blog_status, created_at, updated_at, member_id)
VALUES
(UUID_TO_BIN(UUID()), 'Exploring the Mountains', 4, 'mountains.jpg', 'A personal journey through mountain trails.', 'PERSONAL', 'PUBLISHED', NOW(), NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'Tech Innovations 2025', 5, 'tech.jpg', 'Latest trends and breakthroughs in the tech world.', 'NEWS', 'PUBLISHED', NOW(), NOW(), 'susan_staff'),
(UUID_TO_BIN(UUID()), 'Healthy Living Tips', 3, 'health.jpg', 'Daily advice for a healthier lifestyle.', 'GENERAL', 'DRAFT', NOW(), NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'Traveling on a Budget', 4, 'budget.jpg', 'How to see the world without spending a fortune.', 'NICHE', 'PENDING', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'Java Programming 101', 5, 'java.jpg', 'Step-by-step tutorials for Java beginners.', 'EDUCATIONAL', 'PUBLISHED', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'Gardening for Beginners', 4, 'garden.jpg', 'Starting your own garden made easy.', 'EDUCATIONAL', 'PUBLISHED', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'World Politics Today', 3, 'politics.jpg', 'An in-depth look at current global affairs.', 'NEWS', 'PUBLISHED', NOW(), NOW(), 'susan_staff'),
(UUID_TO_BIN(UUID()), 'Cooking with Passion', 5, 'cooking.jpg', 'Delicious recipes and cooking hacks.', 'GENERAL', 'DRAFT', NOW(), NOW(), 'david_member'),
(UUID_TO_BIN(UUID()), 'Photography as Art', 4, 'photo.jpg', 'Capturing moments, telling stories.', 'PERSONAL', 'PUBLISHED', NOW(), NOW(), 'david_member'),
(UUID_TO_BIN(UUID()), 'Sustainable Living', 5, 'sustainable.jpg', 'Embracing an eco-friendly lifestyle.', 'NICHE', 'PUBLISHED', NOW(), NOW(), 'alex_consult');
