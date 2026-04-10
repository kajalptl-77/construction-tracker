import React, { useState, useEffect } from 'react';
import './App.css';

// API Helper
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';


const api = {
    login: (email, password) =>
        fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(r => r.json()),

    register: (token, data) =>
        fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    getUsers: (token) =>
        fetch(`${API_BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(async (r) => {
            if (!r.ok) {
                const data = await r.json().catch(() => null);
                const message = data?.error || r.statusText || 'Failed to load users';
                throw new Error(message);
            }
            return r.json();
        }),

    getUser: (token, id) =>
        fetch(`${API_BASE_URL}/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    updateUser: (token, id, data) =>
        fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteUser: (token, id) =>
        fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    getSites: (token) =>
        fetch(`${API_BASE_URL}/sites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    createSite: (token, data) =>
        fetch(`${API_BASE_URL}/sites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteSite: (token, id) =>
        fetch(`${API_BASE_URL}/sites/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    getCategories: (token, type = null) => {
        const url = type ? `${API_BASE_URL}/categories?type=${type}` : `${API_BASE_URL}/categories`;
        return fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
    },

    createCategory: (token, data) =>
        fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteCategory: (token, id) =>
        fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    getTransactions: (token, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_BASE_URL}/transactions?${query}` : `${API_BASE_URL}/transactions`;
        return fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json());
    },

    createTransaction: (token, data) =>
        fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    updateTransaction: (token, id, data) =>
        fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteTransaction: (token, id) =>
        fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    getDashboardSummary: (token) =>
        fetch(`${API_BASE_URL}/dashboard/summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),

    exportCSV: (token, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_BASE_URL}/export/csv?${query}` : `${API_BASE_URL}/export/csv`;
        return fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};

// Login Component
function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(email, password);
            if (response.error) {
                setError(response.error);
            } else {
                onLogin(response.token, response.user);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>🔨 Construction Tracker</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="error">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Admin User Management Component
function UserManagement({ token, user }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', mobile_no: '', password: '', role_code: 102 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers(token);
            // Filter to only show regular users (role_code 102)
            const filteredUsers = data.filter(user => user.role_code === 102);
            setUsers(filteredUsers);
            setLoading(false);
        } catch (err) {
            setError('Failed to load users');
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.register(token, formData);
            if (response.error) {
                setError(response.error);
            } else {
                setSuccess('User created successfully!');
                setFormData({ name: '', email: '', mobile_no: '', password: '', role_code: 102 });
                setShowForm(false);
                loadUsers();
            }
        } catch (err) {
            setError('Failed to create user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.deleteUser(token, userId);
                setSuccess('User deleted successfully!');
                loadUsers();
            } catch (err) {
                setError('Failed to delete user');
            }
        }
    };

    return (
        <div className="tab-content">
            <h2>👥 User Management</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {!showForm ? (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + Add New User
                </button>
            ) : (
                <form className="form-container" onSubmit={handleAddUser}>
                    <h3>Create New User</h3>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="tel"
                        placeholder="Mobile No."
                        value={formData.mobile_no}
                        onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn-primary">Create User</button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.mobile_no}</td>
                                <td><span className={`badge ${u.role_code === 101 ? 'admin' : 'user'}`}>{u.role_name}</span></td>
                                <td>{u.is_active ? '✅ Active' : '❌ Inactive'}</td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDeleteUser(u.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Dashboard Component
function Dashboard({ token, user }) {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const data = await api.getDashboardSummary(token);
            setSummary(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load summary');
            setLoading(false);
        }
    };

    const totalInward = summary.reduce((sum, s) => sum + parseFloat(s.total_inward || 0), 0);
    const totalOutward = summary.reduce((sum, s) => sum + parseFloat(s.total_outward || 0), 0);
    const balance = totalInward - totalOutward;

    return (
        <div className="tab-content">
            <h2>📊 Dashboard & Tracker</h2>

            <div className="summary-cards">
                <div className="card inward">
                    <h3>Total Inward (₹)</h3>
                    <p className="amount">{totalInward.toFixed(2)}</p>
                </div>
                <div className="card outward">
                    <h3>Total Outward (₹)</h3>
                    <p className="amount">{totalOutward.toFixed(2)}</p>
                </div>
                <div className="card balance">
                    <h3>Current Balance (₹)</h3>
                    <p className="amount">{balance.toFixed(2)}</p>
                </div>
            </div>

            {loading ? (
                <p>Loading data...</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Site Name</th>
                            <th>Total Inward (₹)</th>
                            <th>Total Outward (₹)</th>
                            <th>Balance (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map(s => (
                            <tr key={s.id}>
                                <td>{s.site_name}</td>
                                <td>{parseFloat(s.total_inward || 0).toFixed(2)}</td>
                                <td>{parseFloat(s.total_outward || 0).toFixed(2)}</td>
                                <td>{(parseFloat(s.total_inward || 0) - parseFloat(s.total_outward || 0)).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Transaction Component
function TransactionForm({ token, user, onSuccess }) {
    const [sites, setSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        transaction_type: 'Money Outward (Expense)',
        site_id: '',
        category_id: '',
        party_vendor_name: '',
        bill_voucher_no: '',
        amount: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (formData.transaction_type) {
            loadCategories(formData.transaction_type);
        }
    }, [formData.transaction_type]);

    const loadData = async () => {
        try {
            const [sitesData, txData] = await Promise.all([
                api.getSites(token),
                api.getTransactions(token)
            ]);
            setSites(sitesData);
            setTransactions(txData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load data');
            setLoading(false);
        }
    };

    const loadCategories = async (type) => {
        try {
            const categoryType = type.includes('Inward') ? 'Inward' : 'Outward';
            const data = await api.getCategories(token, categoryType);
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.createTransaction(token, {
                ...formData,
                site_id: parseInt(formData.site_id),
                category_id: parseInt(formData.category_id),
                amount: parseFloat(formData.amount)
            });

            if (response.error) {
                setError(response.error);
            } else {
                setSuccess('Transaction saved successfully!');
                setFormData({
                    transaction_type: 'Money Outward (Expense)',
                    site_id: '',
                    category_id: '',
                    party_vendor_name: '',
                    bill_voucher_no: '',
                    amount: '',
                    description: ''
                });
                loadData();
                onSuccess?.();
            }
        } catch (err) {
            setError('Failed to save transaction');
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (window.confirm('Delete this transaction?')) {
            try {
                await api.deleteTransaction(token, id);
                setSuccess('Transaction deleted!');
                loadData();
            } catch (err) {
                setError('Failed to delete transaction');
            }
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.exportCSV(token);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.csv';
            a.click();
        } catch (err) {
            setError('Failed to export CSV');
        }
    };

    return (
        <div className="tab-content">
            <h2>💰 Transaction Tracker</h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="summary-cards">
                <div className="card inward">
                    <h3>Total Inward (₹)</h3>
                    <p className="amount">{transactions.filter(t => t.transaction_type === 'Money Inward (Income)').reduce((s, t) => s + parseFloat(t.amount || 0), 0).toFixed(2)}</p>
                </div>
                <div className="card outward">
                    <h3>Total Outward (₹)</h3>
                    <p className="amount">{transactions.filter(t => t.transaction_type === 'Money Outward (Expense)').reduce((s, t) => s + parseFloat(t.amount || 0), 0).toFixed(2)}</p>
                </div>
                <div className="card balance">
                    <h3>Current Balance (₹)</h3>
                    <p className="amount">
                        {(transactions.filter(t => t.transaction_type === 'Money Inward (Income)').reduce((s, t) => s + parseFloat(t.amount || 0), 0) -
                            transactions.filter(t => t.transaction_type === 'Money Outward (Expense)').reduce((s, t) => s + parseFloat(t.amount || 0), 0)).toFixed(2)}
                    </p>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <h3>New Transaction</h3>

                <label>Transaction Type</label>
                <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                >
                    <option value="Money Outward (Expense)">Money Outward (Expense)</option>
                    <option value="Money Inward (Income)">Money Inward (Income)</option>
                </select>

                <label>Category</label>
                <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.category_name}</option>
                    ))}
                </select>

                <label>Amount (₹)</label>
                <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    step="0.01"
                    required
                />

                <label>Site / Project Name</label>
                <select
                    value={formData.site_id}
                    onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                    required
                >
                    <option value="">Select Site</option>
                    {sites.map(s => (
                        <option key={s.id} value={s.id}>{s.site_name}</option>
                    ))}
                </select>

                <label>Party / Vendor Name</label>
                <input
                    type="text"
                    placeholder="e.g. Sharma Steels"
                    value={formData.party_vendor_name}
                    onChange={(e) => setFormData({ ...formData, party_vendor_name: e.target.value })}
                    required
                />

                <label>Bill / Voucher No.</label>
                <input
                    type="text"
                    placeholder="e.g. INV-1042"
                    value={formData.bill_voucher_no}
                    onChange={(e) => setFormData({ ...formData, bill_voucher_no: e.target.value })}
                />

                <label>Short Description (Optional)</label>
                <textarea
                    placeholder="e.g. Advance payment for 100 bags of cement"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                />

                <button type="submit" className="btn-primary btn-block">Save Record</button>
            </form>

            <div style={{ marginTop: '30px' }}>
                <button className="btn-export" onClick={handleExportCSV}>📥 Export to Excel (.csv)</button>
            </div>

            <h3>Recent Transactions</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Site/Project</th>
                            <th>Party/Vendor</th>
                            <th>Bill No.</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount (₹)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                                <td>{t.site_name}</td>
                                <td>{t.party_vendor_name}</td>
                                <td>{t.bill_voucher_no}</td>
                                <td>{t.transaction_type}</td>
                                <td>{t.category_name}</td>
                                <td>{t.description || '-'}</td>
                                <td>{parseFloat(t.amount).toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn-danger btn-small"
                                        onClick={() => handleDeleteTransaction(t.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Settings Component
function Settings({ token, user }) {
    const [sites, setSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newSite, setNewSite] = useState('');
    const [newCategory, setNewCategory] = useState({ name: '', type: 'Outward' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sitesData, categoriesData] = await Promise.all([
                api.getSites(token),
                api.getCategories(token)
            ]);
            setSites(sitesData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Failed to load data');
        }
    };

    const handleAddSite = async (e) => {
        e.preventDefault();
        if (!newSite.trim()) return;

        try {
            const response = await api.createSite(token, { site_name: newSite });
            if (response.error) {
                setError(response.error);
            } else {
                setSuccess('Site added successfully!');
                setNewSite('');
                loadData();
            }
        } catch (err) {
            setError('Failed to add site');
        }
    };

    const handleDeleteSite = async (id) => {
        if (window.confirm('Delete this site?')) {
            try {
                await api.deleteSite(token, id);
                setSuccess('Site deleted!');
                loadData();
            } catch (err) {
                setError('Failed to delete site');
            }
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;

        try {
            const response = await api.createCategory(token, {
                category_name: newCategory.name,
                category_type: newCategory.type
            });
            if (response.error) {
                setError(response.error);
            } else {
                setSuccess('Category added successfully!');
                setNewCategory({ name: '', type: 'Outward' });
                loadData();
            }
        } catch (err) {
            setError('Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await api.deleteCategory(token, id);
                setSuccess('Category deleted!');
                loadData();
            } catch (err) {
                setError('Failed to delete category');
            }
        }
    };

    return (
        <div className="tab-content">
            <h2>⚙️ Manage Sites & Categories</h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="settings-grid">
                <div className="settings-section">
                    <h3>📍 Manage Site / Project Names</h3>
                    <form onSubmit={handleAddSite}>
                        <input
                            type="text"
                            placeholder="Type new site name..."
                            value={newSite}
                            onChange={(e) => setNewSite(e.target.value)}
                        />
                        <button type="submit" className="btn-primary">Add Site</button>
                    </form>
                    <div style={{ marginTop: '20px' }}>
                        {sites.map(site => (
                            <div key={site.id} className="list-item">
                                <span>{site.site_name}</span>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteSite(site.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🏷️ Manage Categories</h3>
                    <form onSubmit={handleAddCategory}>
                        <select
                            value={newCategory.type}
                            onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                        >
                            <option value="Outward">Outward (Expense)</option>
                            <option value="Inward">Inward (Income)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Type new category..."
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                        <button type="submit" className="btn-primary">Add</button>
                    </form>
                    <div style={{ marginTop: '20px' }}>
                        <h4>Outward Categories:</h4>
                        {categories.filter(c => c.category_type === 'Outward').map(cat => (
                            <div key={cat.id} className="list-item">
                                <span>{cat.category_name}</span>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteCategory(cat.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}

                        <h4 style={{ marginTop: '20px' }}>Inward Categories:</h4>
                        {categories.filter(c => c.category_type === 'Inward').map(cat => (
                            <div key={cat.id} className="list-item">
                                <span>{cat.category_name}</span>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteCategory(cat.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main App Component
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogin = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setActiveTab('dashboard');
    };

    if (!token || !user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-left">
                    <h1>🔨 Master Construction Builder Tracker</h1>
                </div>
                <div className="header-right">
                    <span className="user-info">
                        👤 {user.name} ({user.role_name})
                    </span>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard & Tracker
                </button>

                <button
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    💰 Transactions
                </button>

                {user.role_code === 101 && (
                    <>
                        <button
                            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            ⚙️ Manage Sites & Categories
                        </button>
                        <button
                            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            👥 Add Users
                        </button>
                    </>
                )}
            </div>

            <div className="container">
                {activeTab === 'dashboard' && <Dashboard token={token} user={user} />}
                {activeTab === 'transactions' && <TransactionForm token={token} user={user} />}
                {activeTab === 'settings' && user.role_code === 101 && <Settings token={token} user={user} />}
                {activeTab === 'users' && user.role_code === 101 && <UserManagement token={token} user={user} />}
            </div>
        </div>
    );
}

export default App;
