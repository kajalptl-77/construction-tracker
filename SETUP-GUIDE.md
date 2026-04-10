# 🔨 Construction Tracker - Complete Setup Guide

## 📦 Project Structure

```
construction-tracker/
├── backend/
│   ├── server.js              (Express API server)
│   ├── package.json           (Dependencies)
│   ├── .env                   (Environment config)
│   ├── database-schema.sql    (Database structure)
│   └── sample-data.sql        (Test data)
└── frontend/
    ├── src/
    │   ├── App.jsx            (Main React component)
    │   ├── App.css            (Styling)
    │   └── index.js           (Entry point)
    └── package.json           (React dependencies)
```

---

## 🔧 Step-by-Step Installation

### Phase 1: Database Setup (MySQL)

#### Step 1.1 - Install MySQL
```bash
# macOS
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-server

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

#### Step 1.2 - Start MySQL Service
```bash
# macOS
brew services start mysql

# Ubuntu/Debian
sudo systemctl start mysql

# Windows
# Use MySQL Workbench or Command Line
```

#### Step 1.3 - Create Database and Schema
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
mysql -u root -p < database-schema.sql

# Verify database created
mysql -u root -p -e "SHOW DATABASES LIKE 'construction%';"
```

#### Step 1.4 - Insert Sample Data (Optional)
```bash
# Add test data
mysql -u root -p < sample-data.sql
```

---

### Phase 2: Backend Setup (Node.js/Express)

#### Step 2.1 - Install Node.js
```bash
# Download from https://nodejs.org/
# Or use package manager:

# macOS
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm
```

Verify installation:
```bash
node --version  # v14.0.0 or higher
npm --version   # 6.0.0 or higher
```

#### Step 2.2 - Create Backend Directory
```bash
mkdir -p construction-tracker/backend
cd construction-tracker/backend
```

#### Step 2.3 - Copy Backend Files
Place these files in `backend/` directory:
- `server.js`
- `package.json`
- `.env`
- `database-schema.sql`
- `sample-data.sql`

#### Step 2.4 - Install Dependencies
```bash
cd backend
npm install
```

This installs:
- express (web framework)
- mysql2 (database driver)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors (cross-origin requests)
- dotenv (environment variables)

#### Step 2.5 - Configure Environment Variables
Edit `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password    # Change to your MySQL password
DB_NAME=construction_tracker
JWT_SECRET=your-super-secret-key-change-in-production-12345
PORT=3001
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random string for production!

```bash
# Generate a strong secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 2.6 - Create Initial Admin User

**Option A: Using Node.js script**

Create `create-admin.js`:
```javascript
const bcrypt = require('bcryptjs');

// Hash password "admin123"
bcrypt.hash('admin123', 10, (err, hash) => {
    if (err) console.error(err);
    console.log('Hashed password:', hash);
    console.log('Use this in database INSERT');
});
```

Run it:
```bash
node create-admin.js
```

Copy the hash output and use in SQL:

**Option B: Using MySQL directly**

```bash
mysql -u root -p -e "
USE construction_tracker;
INSERT INTO users (name, email, mobile_no, password_hash, role_id, is_active)
VALUES ('Admin User', 'admin@construction.com', '9876543210', '\$2a\$10\$YourHashedPasswordHere', 1, true);
"
```

#### Step 2.7 - Start Backend Server
```bash
npm start
```

Expected output:
```
Server running on port 3001
```

Test the connection:
```bash
curl http://localhost:3001/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@construction.com","password":"admin123"}'
```

---

### Phase 3: Frontend Setup (React)

#### Step 3.1 - Create React App
```bash
cd ..  # Back to construction-tracker/
npx create-react-app frontend
cd frontend
```

#### Step 3.2 - Copy Frontend Files
Replace these files in `frontend/src/`:
- `App.js` → Replace with `App.jsx` contents
- `App.css` → Replace with `App.css`

```bash
# Copy files
cp ../backend/App.jsx src/App.js
cp ../backend/App.css src/App.css
```

#### Step 3.3 - Update React Index (if needed)

Make sure `src/index.js` has:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

#### Step 3.4 - Install Dependencies
```bash
npm install
```

#### Step 3.5 - Update API_BASE_URL (if needed)

If backend is running on different URL, update in `App.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';  // Change if needed
```

#### Step 3.6 - Start Frontend Development Server
```bash
npm start
```

Expected output:
```
Compiled successfully!
You can now view frontend in the browser.
Open http://localhost:3002 to view it in the browser.
```

---

## 🚀 Running the Complete Application

### Terminal 1 - MySQL
```bash
# Ensure MySQL is running
mysql -u root -p
# Keep this window open
```

### Terminal 2 - Backend
```bash
cd construction-tracker/backend
npm start
# Server running on http://localhost:3001
```

### Terminal 3 - Frontend
```bash
cd construction-tracker/frontend
npm start
# App running on http://localhost:3002
```

---

## 🔐 Login with Demo Accounts

### Admin Account
```
Email: admin@construction.com
Password: admin123
Role: Admin (Can manage everything)
```

### Regular Users (if sample data loaded)
```
1. john@construction.com / admin123
2. sarah@construction.com / admin123
3. mike@construction.com / admin123
```

---

## 🧪 Testing the Application

### Test Admin Features
1. Login as admin@construction.com
2. Go to "Add Users" tab
3. Create a new user with role "User"
4. Go to "Manage Sites & Categories"
5. Add new site and categories
6. View all users created

### Test User Features
1. Login as regular user
2. Go to "Transactions" tab
3. Create a transaction (Income or Expense)
4. View dashboard (only see own data)
5. Export to CSV
6. Cannot access "Add Users" or "Manage Sites" tabs

### Test Data Export
1. In Transactions tab, click "Export to Excel (.csv)"
2. CSV file downloads with all transactions
3. Open in Excel/Sheets to verify

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Port 3001 (backend) already in use
lsof -i :3001
kill -9 <PID>

# Or change PORT in .env file
```

### Database Connection Error
```
Error: "connect ECONNREFUSED 127.0.0.1:3306"

Solutions:
1. Check MySQL is running
2. Verify DB credentials in .env
3. Check DB exists: mysql -u root -p -e "SHOW DATABASES;"
4. Check DB has tables: mysql -u root -p construction_tracker -e "SHOW TABLES;"
```

### Module Not Found
```
Error: Cannot find module 'express'

Solution:
cd backend
npm install
npm list  # Verify all packages installed
```

### CORS Error in Browser
```
Error: "Access to XMLHttpRequest blocked by CORS policy"

Solutions:
1. Ensure backend is running on port 3001
2. Check API_BASE_URL in App.jsx is correct
3. Verify CORS is enabled in server.js
```

### Login Always Fails
```
Solutions:
1. Verify user exists: 
   mysql -u root -p -e "SELECT * FROM users WHERE email='admin@construction.com';"
2. Check password hash matches bcrypt format
3. Ensure JWT_SECRET is set in .env
```

---

## 📊 Useful MySQL Commands

```sql
-- Check database
USE construction_tracker;

-- View all tables
SHOW TABLES;

-- View users
SELECT id, name, email, role_id FROM users;

-- View transactions
SELECT * FROM transactions ORDER BY transaction_date DESC;

-- Check total inward/outward
SELECT 
    transaction_type,
    COUNT(*) as count,
    SUM(amount) as total
FROM transactions 
WHERE is_deleted = false
GROUP BY transaction_type;

-- View audit logs
SELECT * FROM audit_logs ORDER BY action_timestamp DESC LIMIT 20;

-- Reset a user password (use bcrypt hash)
UPDATE users SET password_hash = '$2a$10$...' WHERE id = 1;

-- Delete all test data
TRUNCATE TABLE transactions;
TRUNCATE TABLE audit_logs;
```

---

## 🔒 Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Set up proper database backups
- [ ] Enable firewall for database port
- [ ] Use environment variables for all secrets
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your domain
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes for faster queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_user_transactions ON transactions(created_by);
```

### Backend Optimization
```javascript
// Add caching headers in server.js
app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300');
    next();
});

// Add compression
const compression = require('compression');
app.use(compression());
```

### Frontend Optimization
```javascript
// Lazy load routes
const Dashboard = React.lazy(() => import('./Dashboard'));
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Guide](https://jwt.io/introduction)
- [bcryptjs Package](https://www.npmjs.com/package/bcryptjs)

---

## 💡 Tips & Best Practices

1. **Keep Backend Running** - Frontend needs backend API
2. **Check Console Logs** - Browser console for frontend errors
3. **Check Terminal** - Server terminal for backend errors
4. **Test Regularly** - Create, read, update, delete operations
5. **Backup Database** - Regular backups of important data
6. **Monitor Logs** - Check audit_logs for suspicious activity
7. **Update Dependencies** - Keep npm packages updated
8. **Document Changes** - Keep track of modifications

---

## ✅ Verification Checklist

After setup, verify:

- [ ] MySQL running and accessible
- [ ] Database `construction_tracker` created
- [ ] All tables present (SHOW TABLES)
- [ ] Backend running on port 3001
- [ ] Can login with admin credentials
- [ ] Frontend running on port 3000
- [ ] Can create transactions as user
- [ ] Can manage users as admin
- [ ] Can export to CSV
- [ ] Dashboard shows correct totals

---

## 🎯 Next Steps

1. **Customize** - Modify colors, logos, site names
2. **Add Features** - Implement reports, analytics
3. **Integration** - Connect with accounting software
4. **Deployment** - Deploy to cloud (AWS, Heroku, DigitalOcean)
5. **Mobile App** - Build React Native version
6. **API Documentation** - Generate Swagger docs

---

**You're all set! 🚀**

For issues or questions, refer to the main README.md file.
