ALTER TABLE appointment
ADD CONSTRAINT unique_appointment_date_consultant
UNIQUE (appointment_date_time, consultant_id);
