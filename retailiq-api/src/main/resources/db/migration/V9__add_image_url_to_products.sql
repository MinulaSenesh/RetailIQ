-- V9__add_image_url_to_products.sql
-- Add image_url column to products table if it doesn't exist

SET @dbname = DATABASE();
SET @tablename = 'products';
SET @columnname = 'image_url';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE products ADD COLUMN image_url VARCHAR(512) AFTER is_active'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
