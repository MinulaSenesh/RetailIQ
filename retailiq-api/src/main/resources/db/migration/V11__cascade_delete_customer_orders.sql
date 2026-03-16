-- V11__cascade_delete_customer_orders.sql
-- Add ON DELETE CASCADE to customer_id foreign key in orders table
-- This allows deleting a customer and automatically cleaning up their order history

-- First, find the constraint name. In V1 it was created without an explicit name, 
-- but MySQL usually names it orders_ibfk_1 if it's the first FK.
-- According to SHOW CREATE TABLE it is indeed 'orders_ibfk_1'.

ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;

ALTER TABLE orders ADD CONSTRAINT fk_orders_customer 
FOREIGN KEY (customer_id) REFERENCES customers(customer_id) 
ON DELETE CASCADE;
