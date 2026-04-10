# 🔨 Master Construction Builder Tracker

A comprehensive full-stack application for managing construction projects with role-based access control, transaction tracking, and financial management.

## 📋 Features

### Core Features
- ✅ **Role-Based Access Control** (Admin & User roles)
- 💰 **Transaction Management** (Income & Expense tracking)
- 📍 **Multi-Site Management** (Multiple projects/sites)
- 📊 **Dashboard & Analytics** (Real-time financial summaries)
- 📥 **Export to CSV** (Download transaction reports)
- 🔐 **Secure Authentication** (JWT + Password Hashing)
- 👥 **User Management** (Admin can add/edit/delete users)
- 🏷️ **Category Management** (Customizable transaction categories)
- 📝 **Audit Logging** (Track all system changes)

### Admin-Only Features
- 👥 **Add Users** Tab - Create, view, edit, and delete users
- ⚙️ **Manage Sites & Categories** - Configure project sites and expense categories
- 📊 **View All Data** - Access to all transactions across all users
- 📈 **Full Analytics** - Complete financial overview

### User Features
- 💰 **Transaction Entry** - Log income and expense transactions
- 📊 **Personal Dashboard** - View only their own transactions
- 📥 **Export Data** - Export their transactions to CSV
- 👤 **View Profile** - Access their own user information

## 🗄️ Database Schema

### Tables
1. **users** - User accounts with hashed passwords
2. **roles** - Role definitions (Admin: 101, User: 102)
3. **sites** - Project/site information
4. **categories** - Transaction categories (Inward/Outward)
5. **transactions** - Transaction records
6. **user_permissions** - Role-based access control
7. **audit_logs** - System audit trail
8. **dashboard_summary** - Cached dashboard data view
9. **user_transaction_summary** - User-wise transaction summary view

## 📦 Tech Stack

### Backend
- **Node.js + Express.js** - REST API server
- **MySQL 8.0+** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18+** - UI framework
- **CSS3** - Styling
- **Fetch API** - HTTP requests
- **LocalStorage** - Session management

## 🚀 Installation & Setup

### Prerequisites
- Node.js 14+ and npm
- MySQL 8.0+ server running
- Modern web browser

### Backend Setup

1. **Clone and navigate to project**
```bash
cd construction-tracker
npm install
```

2. **Create MySQL Database**
```bash
mysql -u root -p < database-schema.sql
```

3. **Configure Environment Variables**
Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=construction_tracker
JWT_SECRET=your-super-secret-key-change-in-production-12345
PORT=3001
NODE_ENV=development
```

4. **Create Initial Admin User**
```sql
USE construction_tracker;

-- Hash password for "admin123" using bcryptjs
-- bcrypt hash: $2a$10$...
INSERT INTO users (name, email, mobile_no, password_hash, role_id)
VALUES ('Admin User', 'admin@example.com', '9999999999', '$2a$10$YourHashedPasswordHere', 1);
```

Or use this Python script to generate the hash:
```python
import bcrypt
password = "admin123"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode(), salt)
print(hashed.decode())
```

5. **Start Backend Server**
```bash
npm start
```
Server runs on `http://localhost:3001`

### Frontend Setup

1. **Create React App**
```bash
npx create-react-app construction-tracker-frontend
cd construction-tracker-frontend
```

2. **Replace src/App.js with provided App.jsx**
```bash
cp App.jsx src/App.js
cp App.css src/App.css
```

3. **Start Development Server**
```bash
npm start
```
App runs on `http://localhost:3000`

## 🔑 Default Login Credentials

After setting up, use these credentials:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: Admin (101)

## 📖 API Documentation

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Register User (Admin Only)
```
POST /api/auth/register
Headers: { Authorization: "Bearer {token}" }
Body: { name, email, mobile_no, password, role_code }
Response: { message, userId }
```

### User Management (Admin Only)

#### Get All Users
```
GET /api/users
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, name, email, mobile_no, role_name, role_code, is_active, created_at }]
```

#### Get Specific User
```
GET /api/users/:id
Headers: { Authorization: "Bearer {token}" }
Response: { id, name, email, mobile_no, role_name, role_code, is_active, created_at }
```

#### Update User (Admin Only)
```
PUT /api/users/:id
Headers: { Authorization: "Bearer {token}" }
Body: { name, email, mobile_no, is_active }
Response: { message }
```

#### Delete User (Admin Only)
```
DELETE /api/users/:id
Headers: { Authorization: "Bearer {token}" }
Response: { message }
```

### Site Management

#### Create Site
```
POST /api/sites
Headers: { Authorization: "Bearer {token}" }
Body: { site_name, site_code }
Response: { message, siteId }
```

#### Get All Sites
```
GET /api/sites
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, site_name, site_code, created_at }]
```

#### Delete Site (Admin Only)
```
DELETE /api/sites/:id
Headers: { Authorization: "Bearer {token}" }
Response: { message }
```

### Category Management

#### Create Category
```
POST /api/categories
Headers: { Authorization: "Bearer {token}" }
Body: { category_name, category_type }  // type: "Inward" or "Outward"
Response: { message, categoryId }
```

#### Get Categories
```
GET /api/categories?type=Outward
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, category_name, category_type }]
```

#### Delete Category (Admin Only)
```
DELETE /api/categories/:id
Headers: { Authorization: "Bearer {token}" }
Response: { message }
```

### Transaction Management

#### Create Transaction
```
POST /api/transactions
Headers: { Authorization: "Bearer {token}" }
Body: {
  transaction_type,      // "Money Inward (Income)" or "Money Outward (Expense)"
  site_id,
  category_id,
  party_vendor_name,
  bill_voucher_no,
  amount,
  description
}
Response: { message, transactionId }
```

#### Get Transactions
```
GET /api/transactions?site_id=1&start_date=2024-01-01&end_date=2024-12-31
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, transaction_type, site_name, category_name, amount, ... }]
```
Notes:
- Regular users see only their own transactions
- Admins see all transactions

#### Get Transaction by ID
```
GET /api/transactions/:id
Headers: { Authorization: "Bearer {token}" }
Response: { ... transaction details ... }
```

#### Update Transaction
```
PUT /api/transactions/:id
Headers: { Authorization: "Bearer {token}" }
Body: { transaction_type, category_id, party_vendor_name, bill_voucher_no, amount, description }
Response: { message }
```

#### Delete Transaction
```
DELETE /api/transactions/:id
Headers: { Authorization: "Bearer {token}" }
Response: { message }
```

### Dashboard & Analytics

#### Get Dashboard Summary
```
GET /api/dashboard/summary
Headers: { Authorization: "Bearer {token}" }
Response: [{ id, site_name, total_inward, total_outward }]
```

#### Export to CSV
```
GET /api/export/csv?site_id=1&start_date=2024-01-01&end_date=2024-12-31
Headers: { Authorization: "Bearer {token}" }
Response: CSV file download
```

## 🔐 Security Features

1. **Password Hashing** - bcryptjs with salt rounds
2. **JWT Authentication** - Secure token-based authentication
3. **Role-Based Access Control** - Admin vs User permissions
4. **Input Validation** - Server-side validation
5. **SQL Injection Prevention** - Parameterized queries
6. **CORS Protection** - Cross-origin resource sharing controls
7. **Audit Logging** - Track all user actions
8. **Soft Deletes** - Never permanently delete data

## 📊 Role-Based Access Matrix

| Feature | Admin | User |
|---------|-------|------|
| View Dashboard | ✅ | ✅ (Only own) |
| Create Transaction | ✅ | ✅ |
| Edit Own Transaction | ✅ | ✅ |
| Edit Others' Transaction | ✅ | ❌ |
| Delete Transaction | ✅ | ✅ (Own only) |
| Manage Sites | ✅ | ❌ |
| Manage Categories | ✅ | ❌ |
| Add Users | ✅ | ❌ |
| Edit Users | ✅ | ❌ |
| Delete Users | ✅ | ❌ |
| View All Users | ✅ | ❌ |
| View User Data | ✅ | ✅ (Own only) |
| Export CSV | ✅ | ✅ (Own only) |

## 🎯 Usage Examples

### Example 1: Admin Creates a New User
1. Login as Admin
2. Go to "Add Users" tab
3. Fill in: Name, Email, Mobile, Password, Role
4. Click "Create User"
5. New user can login with provided credentials

### Example 2: User Records an Expense
1. Login as User
2. Go to "Transactions" tab
3. Fill in transaction details
4. Select Category, Site, Amount, Party Name
5. Click "Save Record"
6. Transaction appears in the transaction list

### Example 3: Admin Views All Transactions
1. Login as Admin
2. Go to "Dashboard" to see summary or "Transactions" for details
3. Can filter by site, date range
4. Can export to CSV for further analysis

## 🐛 Troubleshooting

### Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:3001
Solution: Ensure backend is running on port 3001
```

### Database Issues
```
Error: Unknown database 'construction_tracker'
Solution: Run database-schema.sql file again
```

### Login Fails
```
Error: Invalid email or password
Solution: Check if .env has correct DB credentials
```

### CORS Issues
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Ensure CORS is enabled in server.js
```

## 📝 Notes

- Always change `JWT_SECRET` in production
- Use strong passwords for admin accounts
- Regularly backup your database
- Monitor audit_logs for suspicious activities
- Keep Node.js and dependencies updated

## 📞 Support

For issues or questions:
1. Check the API documentation above
2. Review error logs in browser console
3. Check server logs in terminal
4. Verify database connectivity

## 📄 License

MIT License - Feel free to use and modify

## 👨‍💻 Developer Notes

- Frontend uses localStorage for session management
- All dates stored in UTC
- Amounts stored as DECIMAL(15,2) for accuracy
- Soft deletes are used (is_deleted flag)
- Audit logs track all modifications

---

**Created:** 2024
**Version:** 1.0.0
**Status:** Production Ready
