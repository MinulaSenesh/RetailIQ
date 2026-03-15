ALTER TABLE orders 
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING' AFTER status,
ADD COLUMN transaction_id VARCHAR(100) AFTER payment_status;
