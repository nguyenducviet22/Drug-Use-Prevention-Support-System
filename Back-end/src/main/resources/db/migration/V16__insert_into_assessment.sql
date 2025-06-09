INSERT INTO assessment (assessment_id, img, risk_level, score, assessment_type, suggested_action, created_at, username)
VALUES
(UUID_TO_BIN(UUID()), 'risk_normal.jpg', 'NORMAL', 85, 'Physical Health', 'Maintain current routine.', NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'low_risk.jpg', 'LOW', 72, 'Financial Stability', 'Consider minor adjustments to savings plan.', NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'moderate.jpg', 'MODERATE', 65, 'Environmental Impact', 'Increase recycling efforts and reduce waste.', NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'high_risk.jpg', 'HIGH', 45, 'Cybersecurity', 'Update security protocols immediately.', NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'critical_risk.jpg', 'CRITICAL', 30, 'Infrastructure', 'Immediate maintenance required.', NOW(), 'john_member'),
(UUID_TO_BIN(UUID()), 'normal.jpg', 'NORMAL', 88, 'Mental Health', 'Continue with existing coping strategies.', NOW(), 'david_member'),
(UUID_TO_BIN(UUID()), 'low.jpg', 'LOW', 78, 'Workload Management', 'Slight adjustments to workload may be beneficial.', NOW(), 'david_member'),
(UUID_TO_BIN(UUID()), 'moderate_risk.jpg', 'MODERATE', 68, 'Nutritional Balance', 'Consult with a nutritionist.', NOW(), 'david_member'),
(UUID_TO_BIN(UUID()), 'high.jpg', 'HIGH', 50, 'Project Delivery', 'Reevaluate timeline and resources.', NOW(), 'david_member'),
(UUID_TO_BIN(UUID()), 'critical.jpg', 'CRITICAL', 25, 'System Integrity', 'Shut down immediately and assess damage.', NOW(), 'david_member');
