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
