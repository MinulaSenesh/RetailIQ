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
