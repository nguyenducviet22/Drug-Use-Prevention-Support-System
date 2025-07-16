INSERT INTO event (
    event_id, event_name, sub_title, duration, quantity, description, image, status,
    start_date, end_date, age_group, created_at, updated_at, created_by_staff,
    approved_by_manager, location, fee, details
) VALUES
-- Hội thảo Nhận thức về Ma túy cho Thanh thiếu niên
(UUID_TO_BIN(UUID()), 'Hội thảo Nhận thức về Ma túy cho Thanh thiếu niên', 'Chương trình nâng cao nhận thức cho giới trẻ', 30, 100,
 'Chương trình nâng cao nhận thức cho giới trẻ',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812156/7221937_zq9s9v.jpg',
 'ONGOING', '2025-06-01 09:00:00', '2025-07-01 17:00:00', 'EVERYONE', NOW(), NOW(), 'kiet_staff', 'kiet_manager',
 'Trung tâm Văn hóa Thanh niên', 0.0, 'Chuyên gia chia sẻ và hoạt động tương tác'),

-- Giao lưu Hành trình Cai nghiện
(UUID_TO_BIN(UUID()), 'Giao lưu Hành trình Cai nghiện', 'Chia sẻ từ người từng nghiện ma túy', 30, 50,
 'Chia sẻ từ người từng nghiện ma túy',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812156/7278303_c1hw2j.jpg',
 'ONGOING', '2025-06-03 09:00:00', '2025-07-03 17:00:00', 'SENIOR', NOW(), NOW(), 'nhot_staff', 'kiet_manager',
 'Nhà Văn hóa Lao động', 0.0, 'Câu chuyện thực tế và phần hỏi đáp'),

-- Chương trình Trường học Nói không với Ma túy
(UUID_TO_BIN(UUID()), 'Chương trình Trường học Nói không với Ma túy', 'Chuyến đi giáo dục tại các trường học', 20, 300,
 'Chuyến đi giáo dục tại các trường học',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812154/7207154_lt2krm.jpg',
 'NOT_STARTED', '2025-07-10 08:00:00', '2025-07-30 17:00:00', 'SENIOR', NOW(), NOW(), 'kiet_staff', 'nhot_manager',
 'Các trường trung học Quận 5', 0.0, 'Giao lưu và triển lãm lưu động'),

-- Tác động của Ma túy đến Gia đình
(UUID_TO_BIN(UUID()), 'Tác động của Ma túy đến Gia đình', 'Hội thảo về tác hại của ma túy trong gia đình', 30, 80,
 'Hội thảo về tác hại của ma túy trong gia đình',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812154/7274742_vv2vz1.jpg',
 'ONGOING', '2025-06-05 08:30:00', '2025-07-05 17:00:00', 'ADOLESCENT', NOW(), NOW(), 'nhot_staff', 'nhot_manager',
 'Nhà Thiếu nhi Thành phố', 0.0, 'Chia sẻ chuyên gia và tình huống thực tế'),

-- Chiến dịch Nói Không với Ma túy
(UUID_TO_BIN(UUID()), 'Chiến dịch Nói Không với Ma túy', 'Chiến dịch toàn quốc tuyên truyền phòng chống ma túy', 15, 500,
 'Chiến dịch toàn quốc tuyên truyền phòng chống ma túy',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812154/7262741_qjlran.jpg',
 'NOT_STARTED', '2025-08-01 09:00:00', '2025-08-15 17:00:00', 'ADOLESCENT', NOW(), NOW(), 'kiet_staff', 'nhot_manager',
 'Toàn quốc (trực tuyến và trực tiếp)', 0.0, 'Truyền thông đa kênh và sự kiện cộng đồng'),

-- Pháp luật và Tội phạm Ma túy
(UUID_TO_BIN(UUID()), 'Pháp luật và Tội phạm Ma túy', 'Chuyên đề pháp luật về tội phạm ma túy', 1, 200,
 'Chuyên đề pháp luật về tội phạm ma túy',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812154/7207157_g7soji.jpg',
 'CANCELLED', '2025-07-20 09:00:00', '2025-07-20 12:00:00', 'ADOLESCENT', NOW(), NOW(), 'nhot_staff', 'kiet_manager',
 'Hội trường Khoa Luật', 0.0, 'Phân tích tình huống và quy định pháp luật'),

-- Cảnh báo Ma túy Tổng hợp
(UUID_TO_BIN(UUID()), 'Cảnh báo Ma túy Tổng hợp', 'Buổi tuyên truyền về nguy cơ của ma túy tổng hợp', 15, 70,
 'Buổi tuyên truyền về nguy cơ của ma túy tổng hợp',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812152/7263892_kp5kfl.jpg',
 'EXPIRED', '2025-05-15 09:00:00', '2025-05-30 16:00:00', 'EVERYONE', NOW(), NOW(), 'kiet_staff', 'nhot_manager',
 'Phòng Truyền thông Sức khỏe', 0.0, 'Thuyết trình và video minh họa'),

-- Hội thảo Chống áp lực bạn bè
(UUID_TO_BIN(UUID()), 'Hội thảo Chống áp lực bạn bè', 'Tập huấn kỹ năng từ chối và ứng phó áp lực', 1, 120,
 'Tập huấn kỹ năng từ chối và ứng phó áp lực',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812150/7266442_tecsa0.jpg',
 'NOT_STARTED', '2025-07-25 14:00:00', '2025-07-25 17:00:00', 'ADULT', NOW(), NOW(), 'nhot_staff', 'nhot_manager',
 'Phòng sinh hoạt cộng đồng Khu B', 0.0, 'Thực hành nhóm và bài tập tình huống'),

-- Diễn đàn Cộng đồng Phòng chống Ma túy
(UUID_TO_BIN(UUID()), 'Diễn đàn Cộng đồng Phòng chống Ma túy', 'Tăng cường vai trò cộng đồng trong phòng ngừa', 8, 150,
 'Tăng cường vai trò cộng đồng trong phòng ngừa',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812149/7221997_hrzxuo.jpg',
 'EXPIRED', '2025-06-02 08:30:00', '2025-06-10 17:00:00', 'ADULT', NOW(), NOW(), 'kiet_staff', 'nhot_manager',
 'Phòng họp UBND Phường 3', 0.0, 'Thảo luận định hướng và chia sẻ từ người dân'),

-- Trại kỹ năng Sống không Ma túy
(UUID_TO_BIN(UUID()), 'Trại kỹ năng Sống không Ma túy', 'Trại kỹ năng sống giúp tránh xa ma túy', 2, 60,
 'Trại kỹ năng sống giúp tránh xa ma túy',
 'https://res.cloudinary.com/dunkk3bz7/image/upload/v1751812149/7221982_o3oheu.jpg',
 'NOT_STARTED', '2025-08-20 09:00:00', '2025-08-21 17:00:00', 'EVERYONE', NOW(), NOW(), 'nhot_staff', 'nhot_manager',
 'Trại Thanh thiếu niên Quốc gia', 0.0, 'Hoạt động trải nghiệm và tư vấn tâm lý');
