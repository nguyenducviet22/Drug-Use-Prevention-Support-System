INSERT INTO qualification (qualification_id, img, degree, institution, year, description, status, created_at, updated_at, consultant_id)
VALUES
(UUID_TO_BIN(UUID()), 'degree1.jpg', 'BACHELOR', 'Stanford University', 2015, 'Bachelor\'s degree in Business Administration.', 'AVAILABLE', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'degree2.jpg', 'MASTER', 'Harvard University', 2018, 'Master\'s degree in International Relations.', 'AVAILABLE', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'degree3.jpg', 'DOCTORAL', 'MIT', 2020, 'Doctoral degree in Data Science.', 'UNAVAILABLE', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'degree4.jpg', 'CERTIFICATION', 'Project Management Institute', 2019, 'PMP Certification for project management.', 'AVAILABLE', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'degree5.jpg', 'BACHELOR', 'University of California, Berkeley', 2014, 'Bachelor\'s degree in Environmental Studies.', 'AVAILABLE', NOW(), NOW(), 'david_consult'),
(UUID_TO_BIN(UUID()), 'degree6.jpg', 'MASTER', 'Columbia University', 2017, 'Master\'s degree in Public Policy.', 'AVAILABLE', NOW(), NOW(), 'david_consult'),
(UUID_TO_BIN(UUID()), 'degree7.jpg', 'CERTIFICATION', 'AWS Academy', 2021, 'AWS Certified Solutions Architect.', 'AVAILABLE', NOW(), NOW(), 'david_consult'),
(UUID_TO_BIN(UUID()), 'degree8.jpg', 'ASSOCIATE', 'Community College of Denver', 2012, 'Associate degree in Business Communication.', 'UNAVAILABLE', NOW(), NOW(), 'david_consult'),
(UUID_TO_BIN(UUID()), 'degree9.jpg', 'MASTER', 'New York University', 2016, 'Master\'s degree in Human Resources.', 'AVAILABLE', NOW(), NOW(), 'alex_consult'),
(UUID_TO_BIN(UUID()), 'degree10.jpg', 'CERTIFICATION', 'Scrum Alliance', 2022, 'Certified Scrum Master (CSM).', 'AVAILABLE', NOW(), NOW(), 'david_consult');
