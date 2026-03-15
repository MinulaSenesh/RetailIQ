-- V1__create_tables.sql
-- retailiq schema creation for MySQL 8

CREATE TABLE customers (
    customer_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    city          VARCHAR(100),
    country       VARCHAR(100) DEFAULT 'Sri Lanka',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    segment       VARCHAR(50),
    rfm_score     DECIMAL(4,2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    category_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    parent_id     BIGINT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
    supplier_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    phone         VARCHAR(20),
    country       VARCHAR(100),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
    product_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name  VARCHAR(255) NOT NULL,
    category_id   BIGINT,
    sku           VARCHAR(100) UNIQUE NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    cost_price    DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    supplier_id   BIGINT,
    is_active     TINYINT(1) DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    user_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL,
    is_active     TINYINT(1) DEFAULT 1,
    last_login    TIMESTAMP NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    order_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id      BIGINT NOT NULL,
    order_date       TIMESTAMP NOT NULL,
    status           VARCHAR(50) NOT NULL,
    total_amount     DECIMAL(12,2)   NOT NULL,
    discount_amount  DECIMAL(10,2)   DEFAULT 0,
    shipping_address TEXT,
    payment_method   VARCHAR(50),
    region           VARCHAR(100),
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    item_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id      BIGINT NOT NULL,
    product_id    BIGINT NOT NULL,
    quantity      INT NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    line_total    DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id)   REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_log (
    log_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id    BIGINT NOT NULL,
    change_qty    INT NOT NULL,
    reason        VARCHAR(100),
    created_by    BIGINT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_log (
    log_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT,
    action        VARCHAR(100) NOT NULL,
    table_name    VARCHAR(100),
    record_id     BIGINT,
    details       TEXT,
    ip_address    VARCHAR(45),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- KEY INDEXES
CREATE INDEX idx_orders_customer_id     ON orders(customer_id);
CREATE INDEX idx_orders_order_date      ON orders(order_date);
CREATE INDEX idx_orders_status          ON orders(status);
CREATE INDEX idx_orders_region          ON orders(region);
CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category_id   ON products(category_id);
CREATE INDEX idx_customers_segment      ON customers(segment);
-- V2__seed_data.sql
-- Realistic sample data for RetailIQ

-- USERS (Password is 'password')
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@retailiq.com', '$2a$12$I9vy/3M9E1ORidpS7bsVCueFIvEGSVAtLMWatA.55IycbGatM9uS.', 'ADMIN'),
('analyst', 'analyst@retailiq.com', '$2a$12$I9vy/3M9E1ORidpS7bsVCueFIvEGSVAtLMWatA.55IycbGatM9uS.', 'ANALYST');

-- CATEGORIES
INSERT INTO categories (name) VALUES 
('Electronics'), ('Clothing'), ('Home & Garden'), ('Food & Beverage'), ('Health & Beauty');

-- SUPPLIERS
INSERT INTO suppliers (name, contact_email, phone, country) VALUES 
('Global Tech Solutions', 'contact@globaltech.com', '+1-555-0100', 'USA'),
('Silk Road Apparels', 'sales@silkroad.lk', '+94-112-555555', 'Sri Lanka'),
('Organic Harvest', 'info@organicharvest.com', '+94-771-222333', 'Sri Lanka');

-- PRODUCTS
INSERT INTO products (product_name, category_id, sku, unit_price, cost_price, stock_quantity, supplier_id) VALUES 
('Smartphone X1', 1, 'ELEC-001', 85000.00, 65000.00, 50, 1),
('Wireless Earbuds', 1, 'ELEC-002', 12000.00, 8000.00, 150, 1),
('Cotton T-Shirt', 2, 'CLOT-001', 2500.00, 1200.00, 300, 2),
('Denim Jeans', 2, 'CLOT-002', 5500.00, 2800.00, 200, 2),
('Coffee Beans 500g', 4, 'FOOD-001', 1800.00, 1100.00, 100, 3),
('Green Tea Pack', 4, 'FOOD-002', 950.00, 600.00, 120, 3),
('Office Chair', 3, 'HOME-001', 15000.00, 9500.00, 25, 1),
('Table Lamp', 3, 'HOME-002', 4500.00, 2500.00, 60, 1),
('Moisturizer 200ml', 5, 'BEAU-001', 3200.00, 1800.00, 80, 2),
('Shampoo 400ml', 5, 'BEAU-002', 1500.00, 900.00, 110, 2);

-- CUSTOMERS
INSERT INTO customers (first_name, last_name, email, phone, city, segment, rfm_score) VALUES 
('Kamal', 'Perera', 'kamal@example.com', '0771234567', 'Colombo', 'Champion', 4.8),
('Nimal', 'Silva', 'nimal@example.com', '0772345678', 'Kandy', 'Loyal', 3.9),
('Sunil', 'Fernando', 'sunil@example.com', '0773456789', 'Galle', 'At Risk', 2.1),
('Amara', 'Herath', 'amara@example.com', '0774567890', 'Jaffna', 'New', 1.5),
('Sam', 'Smith', 'sam@example.com', '0775678901', 'Colombo', 'Potential Loyal', 3.5),
('Dave', 'Jones', 'dave@example.com', '0776789012', 'Negombo', 'Lost', 1.1),
('Mary', 'De Silva', 'mary@example.com', '0777890123', 'Colombo', 'Champion', 4.9),
('John', 'Doe', 'john@example.com', '0778901234', 'Gampaha', 'Loyal', 4.2),
('Jane', 'Ratnayake', 'jane@example.com', '0779012345', 'Kurunegala', 'Promising', 2.8),
('Peter', 'Peiris', 'peter@example.com', '0770123456', 'Colombo', 'Loyal', 3.7);

-- ORDERS (Simple sample, normally you'd have more)
INSERT INTO orders (customer_id, order_date, status, total_amount, discount_amount, region, payment_method) VALUES 
(1, '2026-03-01 10:00:00', 'Delivered', 97000.00, 0, 'Western', 'Credit Card'),
(2, '2026-03-02 11:30:00', 'Delivered', 12000.00, 500.00, 'Central', 'Online Transfer'),
(3, '2026-01-15 09:00:00', 'Delivered', 5500.00, 0, 'Southern', 'Cash'),
(1, '2026-03-05 14:20:00', 'Shipped', 15000.00, 0, 'Western', 'Credit Card'),
(7, '2026-03-06 16:45:00', 'Processing', 3200.00, 100.00, 'Western', 'Online Transfer');

-- ORDER ITEMS
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
(1, 1, 1, 85000.00),
(1, 2, 1, 12000.00),
(2, 2, 1, 12000.00),
(3, 4, 1, 5500.00),
(4, 7, 1, 15000.00),
(5, 9, 1, 3200.00);

-- INVENTORY LOG
INSERT INTO inventory_log (product_id, change_qty, reason, created_by) VALUES 
(1, 50, 'Initial Stock', 1),
(2, 150, 'Initial Stock', 1),
(3, 300, 'Initial Stock', 1),
(1, -1, 'Sale', 1);
-- V3__upload_history.sql
-- Upload history tracking table

CREATE TABLE upload_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename        VARCHAR(255)    NOT NULL,
    original_name   VARCHAR(255)    NOT NULL,
    file_size       BIGINT,
    status          VARCHAR(50)     NOT NULL DEFAULT 'PENDING',  -- PENDING / PROCESSING / COMPLETE / FAILED
    total_rows      INT             DEFAULT 0,
    inserted_rows   INT             DEFAULT 0,
    skipped_rows    INT             DEFAULT 0,
    error_rows      INT             DEFAULT 0,
    error_details   TEXT,
    uploaded_by     BIGINT,
    started_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP       NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- V4__reset_user_passwords.sql
-- Reset admin and analyst passwords to 'password'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy = 'password'
UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'admin@retailiq.com';
UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'analyst@retailiq.com';
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
-- V7__add_contact_fields_to_customers.sql
ALTER TABLE customers 
ADD COLUMN address TEXT,
ADD COLUMN postal_code VARCHAR(32);
ALTER TABLE orders 
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING' AFTER status,
ADD COLUMN transaction_id VARCHAR(100) AFTER payment_status;
