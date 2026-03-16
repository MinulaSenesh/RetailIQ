-- Migration V12: Update user references to SET NULL on delete to allow deleting customers/users
-- This prevents the "NO ACTION" constraint from blocking deletion when audit logs or other history exists

-- 1. Update audit_log
ALTER TABLE audit_log DROP FOREIGN KEY audit_log_ibfk_1;
ALTER TABLE audit_log ADD CONSTRAINT fk_audit_log_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 2. Update inventory_log
ALTER TABLE inventory_log DROP FOREIGN KEY inventory_log_ibfk_2;
ALTER TABLE inventory_log ADD CONSTRAINT fk_inventory_log_user 
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- 3. Update upload_history
ALTER TABLE upload_history DROP FOREIGN KEY upload_history_ibfk_1;
ALTER TABLE upload_history ADD CONSTRAINT fk_upload_history_user 
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- 4. Update customers (the link itself should be NULL if user is deleted directly)
ALTER TABLE customers DROP FOREIGN KEY fk_customer_user;
ALTER TABLE customers ADD CONSTRAINT fk_customer_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
