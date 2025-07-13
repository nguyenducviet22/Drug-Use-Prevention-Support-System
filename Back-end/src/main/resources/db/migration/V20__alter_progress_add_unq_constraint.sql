ALTER TABLE progress
ADD CONSTRAINT unique_lesson_enrollment
UNIQUE (lesson_id, enrollment_id);
