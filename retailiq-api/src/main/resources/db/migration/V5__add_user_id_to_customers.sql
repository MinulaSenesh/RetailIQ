-- Add user_id column to customers table to link Customer to User for authentication
-- Using IF NOT EXISTS to make migration idempotent
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'user_id');

SET @sql = IF(@col_exists = 0, 'ALTER TABLE customers ADD COLUMN user_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND CONSTRAINT_NAME = 'fk_customer_user');

SET @sql2 = IF(@fk_exists = 0, 'ALTER TABLE customers ADD CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(user_id)', 'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
