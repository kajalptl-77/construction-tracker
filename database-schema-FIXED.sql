-- ============================================================================
-- Master Construction Builder Tracker - MySQL Database Schema
-- Database: construction_tracker
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS construction_tracker;

-- Use the database
USE construction_tracker;

-- ============================================================================
-- ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_code INT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert roles
INSERT INTO roles (role_name, role_code, description) VALUES
('Admin', 101, 'Administrator with full access and user management'),
('User', 102, 'Regular user with project access');

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_no VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================================
-- SITES TABLE (Projects/Sites)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    site_code VARCHAR(50) UNIQUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_created_by (created_by)
);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    category_type ENUM('Inward', 'Outward') NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE KEY unique_category_per_creator (category_name, category_type, created_by),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_created_by (created_by)
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type ENUM('Money Inward (Income)', 'Money Outward (Expense)') NOT NULL,
    site_id INT NOT NULL,
    category_id INT NOT NULL,
    party_vendor_name VARCHAR(255) NOT NULL,
    bill_voucher_no VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURDATE(),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_site_id (site_id),
    INDEX idx_category_id (category_id),
    INDEX idx_created_by (created_by),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transactions_site_date (site_id, transaction_date)
);

-- ============================================================================
-- USER PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    site_id INT,
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_site_permission (user_id, site_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (site_id) REFERENCES sites(id)
);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    user_id INT,
    old_values JSON,
    new_values JSON,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_timestamp (action_timestamp),
    INDEX idx_audit_logs_action (action)
);

-- ============================================================================
-- VIEWS FOR DASHBOARD
-- ============================================================================

-- Dashboard Summary View
DROP VIEW IF EXISTS dashboard_summary;
CREATE VIEW dashboard_summary AS
SELECT 
    s.id as site_id,
    s.site_name,
    s.site_code,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Money Inward (Income)' THEN t.amount ELSE 0 END), 0) as total_inward,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Money Outward (Expense)' THEN t.amount ELSE 0 END), 0) as total_outward
FROM sites s
LEFT JOIN transactions t ON s.id = t.site_id AND t.is_deleted = false
WHERE s.is_active = true
GROUP BY s.id, s.site_name, s.site_code;

-- User Transaction Summary View
DROP VIEW IF EXISTS user_transaction_summary;
CREATE VIEW user_transaction_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COUNT(t.id) as total_transactions,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Money Inward (Income)' THEN t.amount ELSE 0 END), 0) as total_inward,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Money Outward (Expense)' THEN t.amount ELSE 0 END), 0) as total_outward
FROM users u
LEFT JOIN transactions t ON u.id = t.created_by AND t.is_deleted = false
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email;

-- ============================================================================
-- VERIFY TABLES CREATED
-- ============================================================================
SELECT 'Database setup complete!' as Status;
SHOW TABLES;
