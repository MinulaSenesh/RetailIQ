-- V10__add_unique_to_customer_user_id.sql
-- Prevent multiple customers from being linked to the same user account

ALTER TABLE customers ADD CONSTRAINT uk_customer_user_id UNIQUE (user_id);
