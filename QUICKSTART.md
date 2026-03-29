# Quick Start Guide

## Get Started in 5 Minutes

### Step 1: Start MySQL Server
```bash
# Windows
net start MySQL80

# Linux
sudo service mysql start

# Mac
brew services start mysql-community-server
```

### Step 2: Create Database
```bash
mysql -u root -p < database/schema.sql
```
(Enter your MySQL password)

### Step 3: Start Backend Server
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python run.py
```
✅ Backend running at `http://localhost:5000`

### Step 4: Open Frontend
```bash
# Open in browser:
frontend/index.html
```
✅ Frontend running

### Step 5: Login with Default Admin
- **URL:** `http://localhost/frontend/login.html`
- **Username:** admin
- **Password:** admin123

Or **Register as Student** on the registration page

---

## Common Tasks

### Add Admin Account
```bash
cd backend
python
```
```python
from app import create_app, db
from app.models.admin import Admin

app = create_app()
with app.app_context():
    admin = Admin(username='newadmin', email='admin2@library.edu')
    admin.set_password('password123')
    db.session.add(admin)
    db.session.commit()
```

### Add Books Manually
Access Admin Dashboard → Manage Books → Add New Book

### Create Test Data
```bash
python scripts/seed_data.py  # (if available)
```

---

## API Testing with Curl

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Search Books
```bash
curl http://localhost:5000/api/books/search?q=python
```

### Get Available Books
```bash
curl http://localhost:5000/api/books/available
```

---

## Important Configuration

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_management
JWT_SECRET_KEY=change_this_to_random_key
```

---

## Port Information

- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:8000` (if using live server)
- MySQL: `localhost:3306`

---

## Database Credentials
- **User:** root
- **Password:** (set during MySQL installation)
- **Database:** library_management

---

## Next Steps

1. ✅ Add books to the library
2. ✅ Register students
3. ✅ Issue books to students
4. ✅ Track fines and transactions
5. ✅ Use chatbot for queries

---

## Need Help?

Check `README.md` for detailed documentation
