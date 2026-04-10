-- sample-data.sql - Initial sample data for testing

USE construction_tracker;

-- Clear existing data (optional)
-- TRUNCATE TABLE audit_logs;
-- TRUNCATE TABLE user_permissions;
-- TRUNCATE TABLE transactions;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE sites;
-- TRUNCATE TABLE users;

-- Insert Admin User
-- Password: admin123 (bcryptjs hash)
INSERT INTO users (name, email, mobile_no, password_hash, role_id, is_active)
VALUES (
    'Admin User',
    'admin@construction.com',
    '9876543210',
    '$2a$10$zbRtL1Ch5M9vtNIpdcqVe.dVHqQ2g7oSE.dqN4bnsLMPy1ZLkJB7G',
    (SELECT id FROM roles WHERE role_code = 101),
    true
);

-- Insert Sample Users
INSERT INTO users (name, email, mobile_no, password_hash, role_id, is_active, created_by)
VALUES 
(
    'John Project Manager',
    'john@construction.com',
    '9123456789',
    '$2a$10$zbRtL1Ch5M9vtNIpdcqVe.dVHqQ2g7oSE.dqN4bnsLMPy1ZLkJB7G',
    (SELECT id FROM roles WHERE role_code = 102),
    true,
    (SELECT id FROM users WHERE email = 'admin@construction.com')
),
(
    'Sarah Accountant',
    'sarah@construction.com',
    '9234567890',
    '$2a$10$zbRtL1Ch5M9vtNIpdcqVe.dVHqQ2g7oSE.dqN4bnsLMPy1ZLkJB7G',
    (SELECT id FROM roles WHERE role_code = 102),
    true,
    (SELECT id FROM users WHERE email = 'admin@construction.com')
),
(
    'Mike Site Manager',
    'mike@construction.com',
    '9345678901',
    '$2a$10$zbRtL1Ch5M9vtNIpdcqVe.dVHqQ2g7oSE.dqN4bnsLMPy1ZLkJB7G',
    (SELECT id FROM roles WHERE role_code = 102),
    true,
    (SELECT id FROM users WHERE email = 'admin@construction.com')
);

-- Insert Sample Sites
INSERT INTO sites (site_name, site_code, created_by, is_active)
VALUES 
(
    'Main Office',
    'SITE-001',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Site A - City Center',
    'SITE-A-CC',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Site B - Industrial Area',
    'SITE-B-IA',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Site C - Highway Project',
    'SITE-C-HP',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
);

-- Insert Outward (Expense) Categories
INSERT INTO categories (category_name, category_type, created_by, is_active)
VALUES 
(
    'Raw Materials',
    'Outward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Labor & Wages',
    'Outward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Machinery Rent',
    'Outward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Site Expenses',
    'Outward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Transportation',
    'Outward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Equipment Purchase',
    'Outward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
);

-- Insert Inward (Income) Categories
INSERT INTO categories (category_name, category_type, created_by, is_active)
VALUES 
(
    'Client Payment',
    'Inward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Funding',
    'Inward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Scrap Sale',
    'Inward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
),
(
    'Insurance Claim',
    'Inward',
    (SELECT id FROM users WHERE email = 'admin@construction.com'),
    true
);

-- Insert Sample Transactions (Expenses)
INSERT INTO transactions (
    transaction_type, site_id, category_id, party_vendor_name, 
    bill_voucher_no, amount, description, created_by, transaction_date
)
VALUES 
(
    'Money Outward (Expense)',
    (SELECT id FROM sites WHERE site_code = 'SITE-001'),
    (SELECT id FROM categories WHERE category_name = 'Raw Materials' LIMIT 1),
    'Sharma Steels Pvt Ltd',
    'INV-2024-001',
    150000.00,
    'Advance payment for 500 units steel rods',
    (SELECT id FROM users WHERE email = 'john@construction.com'),
    '2024-01-15'
),
(
    'Money Outward (Expense)',
    (SELECT id FROM sites WHERE site_code = 'SITE-A-CC'),
    (SELECT id FROM categories WHERE category_name = 'Labor & Wages' LIMIT 1),
    'Construction Workers Union',
    'SAL-2024-001',
    250000.00,
    'January salary for 50 workers',
    (SELECT id FROM users WHERE email = 'sarah@construction.com'),
    '2024-01-31'
),
(
    'Money Outward (Expense)',
    (SELECT id FROM sites WHERE site_code = 'SITE-B-IA'),
    (SELECT id FROM categories WHERE category_name = 'Machinery Rent' LIMIT 1),
    'Heavy Machinery Rentals Inc',
    'RENT-2024-001',
    75000.00,
    'Monthly rental for excavator and crane (30 days)',
    (SELECT id FROM users WHERE email = 'mike@construction.com'),
    '2024-02-01'
),
(
    'Money Outward (Expense)',
    (SELECT id FROM sites WHERE site_code = 'SITE-A-CC'),
    (SELECT id FROM categories WHERE category_name = 'Site Expenses' LIMIT 1),
    'ABC Suppliers',
    'INV-2024-002',
    45000.00,
    'Consumables and safety equipment',
    (SELECT id FROM users WHERE email = 'john@construction.com'),
    '2024-02-05'
),
(
    'Money Outward (Expense)',
    (SELECT id FROM sites WHERE site_code = 'SITE-C-HP'),
    (SELECT id FROM categories WHERE category_name = 'Transportation' LIMIT 1),
    'Transport Logistics Ltd',
    'BILL-2024-001',
    120000.00,
    'Material transportation and logistics for month of Feb',
    (SELECT id FROM users WHERE email = 'mike@construction.com'),
    '2024-02-10'
),
(
    'Money Outward (Expense)',
    (SELECT id FROM sites WHERE site_code = 'SITE-B-IA'),
    (SELECT id FROM categories WHERE category_name = 'Equipment Purchase' LIMIT 1),
    'Tech Equipment Store',
    'INV-2024-003',
    85000.00,
    'Computer, printer, and office equipment',
    (SELECT id FROM users WHERE email = 'sarah@construction.com'),
    '2024-02-15'
);

-- Insert Sample Transactions (Income)
INSERT INTO transactions (
    transaction_type, site_id, category_id, party_vendor_name, 
    bill_voucher_no, amount, description, created_by, transaction_date
)
VALUES 
(
    'Money Inward (Income)',
    (SELECT id FROM sites WHERE site_code = 'SITE-001'),
    (SELECT id FROM categories WHERE category_name = 'Client Payment' LIMIT 1),
    'Metropolitan Development Corp',
    'CHECK-2024-001',
    500000.00,
    'First phase payment for Main Office project',
    (SELECT id FROM users WHERE email = 'john@construction.com'),
    '2024-01-20'
),
(
    'Money Inward (Income)',
    (SELECT id FROM sites WHERE site_code = 'SITE-A-CC'),
    (SELECT id FROM categories WHERE category_name = 'Client Payment' LIMIT 1),
    'City Builders Limited',
    'TRANSFER-2024-001',
    750000.00,
    'Milestone payment for City Center project',
    (SELECT id FROM users WHERE email = 'sarah@construction.com'),
    '2024-02-01'
),
(
    'Money Inward (Income)',
    (SELECT id FROM sites WHERE site_code = 'SITE-B-IA'),
    (SELECT id FROM categories WHERE category_name = 'Scrap Sale' LIMIT 1),
    'Metal Recyclers Pvt Ltd',
    'INV-SCRAP-001',
    45000.00,
    'Sale of scrap metal and unused materials',
    (SELECT id FROM users WHERE email = 'mike@construction.com'),
    '2024-02-12'
),
(
    'Money Inward (Income)',
    (SELECT id FROM sites WHERE site_code = 'SITE-C-HP'),
    (SELECT id FROM categories WHERE category_name = 'Funding' LIMIT 1),
    'Government Highway Fund',
    'GRANT-2024-001',
    1000000.00,
    'Government grant for Highway Project Phase 2',
    (SELECT id FROM users WHERE email = 'john@construction.com'),
    '2024-02-15'
),
(
    'Money Inward (Income)',
    (SELECT id FROM sites WHERE site_code = 'SITE-A-CC'),
    (SELECT id FROM categories WHERE category_name = 'Insurance Claim' LIMIT 1),
    'Reliable Insurance Company',
    'CLAIM-2024-001',
    200000.00,
    'Insurance claim settlement for equipment damage',
    (SELECT id FROM users WHERE email = 'sarah@construction.com'),
    '2024-02-18'
);

-- Display inserted data
SELECT '=== USERS ===' as '';
SELECT id, name, email, role_id, is_active FROM users;

SELECT '=== SITES ===' as '';
SELECT id, site_name, site_code FROM sites WHERE is_active = true;

SELECT '=== CATEGORIES ===' as '';
SELECT id, category_name, category_type FROM categories WHERE is_active = true;

SELECT '=== TRANSACTIONS ===' as '';
SELECT 
    id, 
    DATE(transaction_date) as date,
    (SELECT site_name FROM sites WHERE sites.id = transactions.site_id) as site,
    transaction_type,
    (SELECT category_name FROM categories WHERE categories.id = transactions.category_id) as category,
    party_vendor_name,
    amount
FROM transactions 
WHERE is_deleted = false
ORDER BY transaction_date DESC;

SELECT '=== SUMMARY ===' as '';
SELECT 
    'Total Income' as type,
    COALESCE(SUM(amount), 0) as amount
FROM transactions 
WHERE is_deleted = false AND transaction_type = 'Money Inward (Income)'
UNION ALL
SELECT 
    'Total Expense' as type,
    COALESCE(SUM(amount), 0) as amount
FROM transactions 
WHERE is_deleted = false AND transaction_type = 'Money Outward (Expense)'
UNION ALL
SELECT 
    'Net Balance' as type,
    COALESCE(
        (SELECT SUM(amount) FROM transactions WHERE is_deleted = false AND transaction_type = 'Money Inward (Income)') -
        (SELECT SUM(amount) FROM transactions WHERE is_deleted = false AND transaction_type = 'Money Outward (Expense)'),
        0
    ) as amount;
