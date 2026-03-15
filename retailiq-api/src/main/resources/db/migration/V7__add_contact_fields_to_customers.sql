-- V7__add_contact_fields_to_customers.sql
ALTER TABLE customers 
ADD COLUMN address TEXT,
ADD COLUMN postal_code VARCHAR(32);
