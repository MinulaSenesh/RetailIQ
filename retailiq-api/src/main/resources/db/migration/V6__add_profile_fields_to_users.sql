-- V6__add_profile_fields_to_users.sql
-- Add firstName, lastName, and avatarUrl to users table

ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);

-- Update existing user records if they correspond to customers
UPDATE users u
JOIN customers c ON u.user_id = c.user_id
SET u.first_name = c.first_name,
    u.last_name = c.last_name
WHERE u.role = 'CUSTOMER';
