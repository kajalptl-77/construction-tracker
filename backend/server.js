// server.js - Express Backend for Construction Tracker

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl: {
        rejectUnauthorized: false
    }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ========== AUTHENTICATION MIDDLEWARE ==========

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role_code)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// ========== AUTHENTICATION ROUTES ==========

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await pool.getConnection();

        const [users] = await connection.query(
            'SELECT id, name, email, password_hash, role_id FROM users WHERE email = ? AND is_active = true',
            [email]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            connection.release();
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get role info
        const [roles] = await connection.query(
            'SELECT role_name, role_code FROM roles WHERE id = ?',
            [user.role_id]
        );

        connection.release();

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            name: user.name,
            role_id: user.role_id,
            role_code: roles[0].role_code,
            role_name: roles[0].role_name
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role_code: roles[0].role_code,
                role_name: roles[0].role_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register (Admin only)
app.post('/api/auth/register', authenticateToken, authorizeRole([101]), async (req, res) => {
    try {
        const { name, email, mobile_no, password, role_code } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const connection = await pool.getConnection();

        // Check if user already exists
        const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            connection.release();
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Get role ID from role_code
        const [roles] = await connection.query(
            'SELECT id FROM roles WHERE role_code = ?',
            [role_code || 102] // Default to User role
        );

        if (roles.length === 0) {
            connection.release();
            return res.status(400).json({ error: 'Invalid role' });
        }

        const [result] = await connection.query(
            'INSERT INTO users (name, email, mobile_no, password_hash, role_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, mobile_no, passwordHash, roles[0].id, req.user.userId]
        );

        // Log audit
        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values) VALUES (?, ?, ?, ?, ?)',
            ['CREATE', 'users', result.insertId, req.user.userId, JSON.stringify({ name, email, role_code })]
        );

        connection.release();

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== USER MANAGEMENT ROUTES (Admin Only) ==========

// Get all users
app.get('/api/users', authenticateToken, authorizeRole([101]), async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [users] = await connection.query(`
            SELECT u.id, u.name, u.email, u.mobile_no, u.is_active, u.created_at, r.role_name, r.role_code
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `);

        connection.release();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get specific user
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Users can only view their own data, admins can view any user
        if (req.user.role_code !== 101 && req.user.userId !== parseInt(id)) {
            return res.status(403).json({ error: 'You can only view your own data' });
        }

        const connection = await pool.getConnection();

        const [users] = await connection.query(`
            SELECT u.id, u.name, u.email, u.mobile_no, u.is_active, u.created_at, r.role_name, r.role_code
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `, [id]);

        connection.release();

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user (Admin only)
app.put('/api/users/:id', authenticateToken, authorizeRole([101]), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobile_no, is_active } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE users SET name = ?, email = ?, mobile_no = ?, is_active = ? WHERE id = ?',
            [name, email, mobile_no, is_active, id]
        );

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values) VALUES (?, ?, ?, ?, ?)',
            ['UPDATE', 'users', id, req.user.userId, JSON.stringify({ name, email, mobile_no, is_active })]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user (soft delete - Admin only)
app.delete('/api/users/:id', authenticateToken, authorizeRole([101]), async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE users SET is_active = false WHERE id = ?',
            [id]
        );

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id) VALUES (?, ?, ?, ?)',
            ['DELETE', 'users', id, req.user.userId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== SITE MANAGEMENT ROUTES ==========

// Create site
app.post('/api/sites', authenticateToken, async (req, res) => {
    try {
        const { site_name, site_code } = req.body;

        if (!site_name) {
            return res.status(400).json({ error: 'Site name is required' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'INSERT INTO sites (site_name, site_code, created_by) VALUES (?, ?, ?)',
            [site_name, site_code || null, req.user.userId]
        );

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values) VALUES (?, ?, ?, ?, ?)',
            ['CREATE', 'sites', result.insertId, req.user.userId, JSON.stringify({ site_name, site_code })]
        );

        connection.release();

        res.status(201).json({
            message: 'Site created successfully',
            siteId: result.insertId
        });
    } catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all sites
app.get('/api/sites', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [sites] = await connection.query(`
            SELECT id, site_name, site_code, created_at
            FROM sites
            WHERE is_active = true
            ORDER BY created_at DESC
        `);

        connection.release();
        res.json(sites);
    } catch (error) {
        console.error('Get sites error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete site
app.delete('/api/sites/:id', authenticateToken, authorizeRole([101]), async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        await connection.query('UPDATE sites SET is_active = false WHERE id = ?', [id]);

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id) VALUES (?, ?, ?, ?)',
            ['DELETE', 'sites', id, req.user.userId]
        );

        connection.release();

        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Delete site error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== CATEGORY MANAGEMENT ROUTES ==========

// Create category
app.post('/api/categories', authenticateToken, async (req, res) => {
    try {
        const { category_name, category_type } = req.body;

        if (!category_name || !category_type) {
            return res.status(400).json({ error: 'Category name and type are required' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'INSERT INTO categories (category_name, category_type, created_by) VALUES (?, ?, ?)',
            [category_name, category_type, req.user.userId]
        );

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values) VALUES (?, ?, ?, ?, ?)',
            ['CREATE', 'categories', result.insertId, req.user.userId, JSON.stringify({ category_name, category_type })]
        );

        connection.release();

        res.status(201).json({
            message: 'Category created successfully',
            categoryId: result.insertId
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get categories by type
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const { type } = req.query;

        const connection = await pool.getConnection();

        let query = 'SELECT id, category_name, category_type FROM categories WHERE is_active = true';
        let params = [];

        if (type) {
            query += ' AND category_type = ?';
            params.push(type);
        }

        const [categories] = await connection.query(query, params);

        connection.release();
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete category
app.delete('/api/categories/:id', authenticateToken, authorizeRole([101]), async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        await connection.query('UPDATE categories SET is_active = false WHERE id = ?', [id]);

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id) VALUES (?, ?, ?, ?)',
            ['DELETE', 'categories', id, req.user.userId]
        );

        connection.release();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== TRANSACTION ROUTES ==========

// Create transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { transaction_type, site_id, category_id, party_vendor_name, bill_voucher_no, amount, description } = req.body;

        if (!transaction_type || !site_id || !category_id || !party_vendor_name || !amount) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO transactions 
             (transaction_type, site_id, category_id, party_vendor_name, bill_voucher_no, amount, description, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [transaction_type, site_id, category_id, party_vendor_name, bill_voucher_no, amount, description, req.user.userId]
        );

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values) VALUES (?, ?, ?, ?, ?)',
            ['CREATE', 'transactions', result.insertId, req.user.userId, 
             JSON.stringify({ transaction_type, site_id, category_id, amount })]
        );

        connection.release();

        res.status(201).json({
            message: 'Transaction created successfully',
            transactionId: result.insertId
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { site_id, start_date, end_date, limit = 100, offset = 0 } = req.query;
        const connection = await pool.getConnection();

        let query = `
            SELECT t.*, s.site_name, c.category_name, u.name as created_by_name
            FROM transactions t
            JOIN sites s ON t.site_id = s.id
            JOIN categories c ON t.category_id = c.id
            JOIN users u ON t.created_by = u.id
            WHERE t.is_deleted = false
        `;
        let params = [];

        if (site_id) {
            query += ' AND t.site_id = ?';
            params.push(site_id);
        }

        if (start_date) {
            query += ' AND t.transaction_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND t.transaction_date <= ?';
            params.push(end_date);
        }

        // Regular users can only see their own transactions
        if (req.user.role_code === 102) {
            query += ' AND t.created_by = ?';
            params.push(req.user.userId);
        }

        query += ' ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [transactions] = await connection.query(query, params);

        connection.release();
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get transaction by ID
app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        const [transactions] = await connection.query(`
            SELECT t.*, s.site_name, c.category_name, u.name as created_by_name
            FROM transactions t
            JOIN sites s ON t.site_id = s.id
            JOIN categories c ON t.category_id = c.id
            JOIN users u ON t.created_by = u.id
            WHERE t.id = ? AND t.is_deleted = false
        `, [id]);

        connection.release();

        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = transactions[0];

        // Check authorization
        if (req.user.role_code === 102 && transaction.created_by !== req.user.userId) {
            return res.status(403).json({ error: 'You can only view your own transactions' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update transaction
app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { transaction_type, category_id, party_vendor_name, bill_voucher_no, amount, description } = req.body;

        const connection = await pool.getConnection();

        // Check authorization
        const [transactions] = await connection.query('SELECT created_by FROM transactions WHERE id = ?', [id]);

        if (transactions.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (req.user.role_code === 102 && transactions[0].created_by !== req.user.userId) {
            connection.release();
            return res.status(403).json({ error: 'You can only edit your own transactions' });
        }

        const [result] = await connection.query(
            `UPDATE transactions 
             SET transaction_type = ?, category_id = ?, party_vendor_name = ?, bill_voucher_no = ?, amount = ?, description = ?
             WHERE id = ?`,
            [transaction_type, category_id, party_vendor_name, bill_voucher_no, amount, description, id]
        );

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values) VALUES (?, ?, ?, ?, ?)',
            ['UPDATE', 'transactions', id, req.user.userId, 
             JSON.stringify({ transaction_type, category_id, amount })]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete transaction (soft delete)
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        const [transactions] = await connection.query('SELECT created_by FROM transactions WHERE id = ?', [id]);

        if (transactions.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (req.user.role_code === 102 && transactions[0].created_by !== req.user.userId) {
            connection.release();
            return res.status(403).json({ error: 'You can only delete your own transactions' });
        }

        await connection.query('UPDATE transactions SET is_deleted = true WHERE id = ?', [id]);

        await connection.query(
            'INSERT INTO audit_logs (action, table_name, record_id, user_id) VALUES (?, ?, ?, ?)',
            ['DELETE', 'transactions', id, req.user.userId]
        );

        connection.release();

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== DASHBOARD ROUTES ==========

// Get dashboard summary
app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        let query = `
            SELECT 
                s.id, s.site_name,
                COALESCE(SUM(CASE WHEN t.transaction_type = 'Money Inward (Income)' THEN t.amount ELSE 0 END), 0) as total_inward,
                COALESCE(SUM(CASE WHEN t.transaction_type = 'Money Outward (Expense)' THEN t.amount ELSE 0 END), 0) as total_outward
            FROM sites s
            LEFT JOIN transactions t ON s.id = t.site_id AND t.is_deleted = false
            WHERE s.is_active = true
        `;

        // Regular users only see their own data
        if (req.user.role_code === 102) {
            query += ` AND t.created_by = ? `;
            const [summary] = await connection.query(query + ' GROUP BY s.id, s.site_name', [req.user.userId]);
            connection.release();
            return res.json(summary);
        }

        const [summary] = await connection.query(query + ' GROUP BY s.id, s.site_name');
        connection.release();
        res.json(summary);
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export to CSV
app.get('/api/export/csv', authenticateToken, async (req, res) => {
    try {
        const { site_id, start_date, end_date } = req.query;
        const connection = await pool.getConnection();

        let query = `
            SELECT t.transaction_date, s.site_name, t.party_vendor_name, t.bill_voucher_no,
                   t.transaction_type, c.category_name, t.amount, t.description
            FROM transactions t
            JOIN sites s ON t.site_id = s.id
            JOIN categories c ON t.category_id = c.id
            WHERE t.is_deleted = false
        `;
        let params = [];

        if (site_id) {
            query += ' AND t.site_id = ?';
            params.push(site_id);
        }

        if (start_date) {
            query += ' AND t.transaction_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND t.transaction_date <= ?';
            params.push(end_date);
        }

        if (req.user.role_code === 102) {
            query += ' AND t.created_by = ?';
            params.push(req.user.userId);
        }

        query += ' ORDER BY t.transaction_date DESC';

        const [transactions] = await connection.query(query, params);
        connection.release();

        // Generate CSV
        let csv = 'Date,Site,Party/Vendor,Bill No.,Type,Category,Amount,Description\n';
        transactions.forEach(t => {
            csv += `"${t.transaction_date}","${t.site_name}","${t.party_vendor_name}","${t.bill_voucher_no}","${t.transaction_type}","${t.category_name}","${t.amount}","${t.description || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========== ERROR HANDLING ==========

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// ========== SERVER STARTUP ==========

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
