# 🗄️ How to Import the Database - Complete Guide

## ✅ Quick Fix for Database Import

The issue with the original schema was it used PostgreSQL syntax. MySQL needs different syntax.
**Use `database-schema-FIXED.sql` instead!**

---

## 📋 METHOD 1: Using MySQL Command Line (RECOMMENDED)

### Step 1: Open Command Line/Terminal
```bash
# Windows: Open Command Prompt or PowerShell
# macOS/Linux: Open Terminal
```

### Step 2: Navigate to your project folder
```bash
cd path/to/your/project
# Example: cd C:\Users\YourName\Desktop\construction-tracker
```

### Step 3: Login to MySQL
```bash
mysql -u root -p
```
- When prompted for password, enter your MySQL password
- If no password, just press Enter

### Step 4: Import the database schema
```bash
mysql -u root -p construction_tracker < database-schema-FIXED.sql
```

**Or without password (if you have no password):**
```bash
mysql -u root construction_tracker < database-schema-FIXED.sql
```

### Step 5: Verify the database was created
```bash
mysql -u root -p -e "USE construction_tracker; SHOW TABLES;"
```

Expected output:
```
+---------------------------+
| Tables_in_construction_tracker |
+---------------------------+
| audit_logs                |
| categories                |
| roles                     |
| sites                     |
| transactions              |
| user_permissions          |
| users                     |
+---------------------------+
```

---

## 📋 METHOD 2: Using MySQL Workbench (GUI)

### Step 1: Open MySQL Workbench
- Launch MySQL Workbench application
- Connect to your local MySQL server

### Step 2: Open the SQL File
- Click File → Open SQL Script
- Select `database-schema-FIXED.sql`

### Step 3: Execute the Script
- Click the Execute button (lightning bolt icon)
- Or press Ctrl+Shift+Enter

### Step 4: Verify Success
- Check the Output panel at the bottom
- Should show "Database setup complete!"
- Check the left panel Schemas - you should see `construction_tracker`

---

## 📋 METHOD 3: Using PhpMyAdmin (Web Interface)

### Step 1: Access PhpMyAdmin
- Open your browser
- Go to `http://localhost/phpmyadmin`
- Login with your MySQL credentials

### Step 2: Create Database
- Click "New" on the left
- Enter database name: `construction_tracker`
- Click Create

### Step 3: Import Schema
- Select the `construction_tracker` database
- Click "Import" tab
- Click "Choose File"
- Select `database-schema-FIXED.sql`
- Click "Go"

### Step 4: Verify
- Refresh the page
- You should see all 7 tables listed

---

## ✨ Common Issues & Solutions

### Issue 1: "Access denied for user 'root'@'localhost'"
**Solution:** 
```bash
# Use correct password
mysql -u root -p

# Or if MySQL is running with no password (XAMPP/WAMP)
mysql -u root
```

### Issue 2: "Unknown database 'construction_tracker'"
**Solution:** 
The script creates the database automatically, but if it doesn't:
```bash
# First create database
mysql -u root -p -e "CREATE DATABASE construction_tracker;"

# Then import schema
mysql -u root -p construction_tracker < database-schema-FIXED.sql
```

### Issue 3: "Syntax error near line X"
**Solution:**
Make sure you're using `database-schema-FIXED.sql` (MySQL version)
NOT the original schema file (it was PostgreSQL syntax)

### Issue 4: File not found error
**Solution:**
Make sure the SQL file is in the same directory as your command line,
or use full path:
```bash
mysql -u root -p construction_tracker < C:\full\path\to\database-schema-FIXED.sql
```

### Issue 5: "Table already exists"
**Solution:**
Drop the database first:
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS construction_tracker; CREATE DATABASE construction_tracker;"

mysql -u root -p construction_tracker < database-schema-FIXED.sql
```

---

## 🧪 Verify Database Setup

After importing, run these commands to verify everything:

### Check Database Exists
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'construction%';"
```

### Check Tables
```bash
mysql -u root -p construction_tracker -e "SHOW TABLES;"
```

### Check Table Structure (Users)
```bash
mysql -u root -p construction_tracker -e "DESCRIBE users;"
```

### Check Roles Data
```bash
mysql -u root -p construction_tracker -e "SELECT * FROM roles;"
```

Expected output:
```
+----+-----------+-----------+---------------------------------------------+
| id | role_name | role_code | description                                 |
+----+-----------+-----------+---------------------------------------------+
|  1 | Admin     |       101 | Administrator with full access and user ... |
|  2 | User      |       102 | Regular user with project access            |
+----+-----------+-----------+---------------------------------------------+
```

---

## 📊 Database Structure

After successful import, you'll have:

**7 Tables:**
1. `roles` - Admin (101) and User (102)
2. `users` - User accounts
3. `sites` - Projects/locations
4. `categories` - Income/Expense types
5. `transactions` - Income & expenses
6. `user_permissions` - Access control
7. `audit_logs` - Change tracking

**2 Views:**
1. `dashboard_summary` - Site totals
2. `user_transaction_summary` - User stats

**Relationships:**
- users → roles (foreign key)
- transactions → sites, categories, users (foreign keys)
- audit_logs → users (foreign key)

---

## 🚀 Next Steps

After importing the database:

1. ✅ Database created successfully
2. 📄 Load sample data (optional):
   ```bash
   mysql -u root -p construction_tracker < sample-data.sql
   ```

3. 🔧 Update `.env` file in backend:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password  # Change to your MySQL password
   DB_NAME=construction_tracker
   JWT_SECRET=your-secret-key
   PORT=3002
   ```

4. 💻 Start backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

5. 🌐 In another terminal, start frontend:
   ```bash
   cd frontend
   npm start
   ```

6. 🔑 Login with:
   ```
   Email: admin@construction.com
   Password: admin123
   (Only if you loaded sample-data.sql)
   ```

---

## 🔍 Troubleshooting Table

| Problem | Cause | Solution |
|---------|-------|----------|
| Access denied | Wrong password | Use correct MySQL password with `-p` |
| File not found | Wrong path | Use full path or navigate to correct directory |
| Unknown database | Not created | Script creates it, but check output |
| Syntax error | Wrong SQL file | Use database-schema-FIXED.sql (MySQL) |
| Table exists | Already imported | Drop and recreate: `DROP DATABASE construction_tracker;` |
| Connection refused | MySQL not running | Start MySQL service first |

---

## 💡 Pro Tips

1. **Always backup before reimporting:**
   ```bash
   mysqldump -u root -p construction_tracker > backup.sql
   ```

2. **Use `-p` without space for security:**
   ```bash
   mysql -u root -p < file.sql
   # Prompts for password (more secure)
   ```

3. **Save your MySQL password in safe place** for reference

4. **Test connection before starting backend:**
   ```bash
   mysql -u root -p construction_tracker -e "SELECT 1;"
   ```

5. **Keep database-schema-FIXED.sql backed up** for reinstalls

---

## ✅ Success Checklist

After database import:

- [ ] No error messages in terminal
- [ ] "Database setup complete!" message shown
- [ ] 7 tables created in database
- [ ] 2 views created
- [ ] Roles table has 2 entries (Admin, User)
- [ ] Can connect from backend
- [ ] Sample data loaded (if desired)
- [ ] Can login to application

---

## 📞 Need Help?

1. **Check the output** - It tells you what went wrong
2. **Use correct file** - Must be `database-schema-FIXED.sql`
3. **Verify MySQL running** - `mysql -u root -p` should connect
4. **Check password** - Correct MySQL password is essential
5. **Read the guides** - Complete instructions in README.md

---

**You're all set! The database is ready to use. 🚀**

Continue with backend setup in SETUP-GUIDE.md
