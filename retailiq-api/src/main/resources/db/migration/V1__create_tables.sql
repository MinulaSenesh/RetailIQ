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
