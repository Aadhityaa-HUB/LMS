# Library Management System

A comprehensive library management system with admin panel, student portal, chatbot support, QR code tracking, fine calculation, and most-read book analytics.

## Features

✅ **Admin Login** - Secure admin authentication  
✅ **Book Management** - Add, update, delete, and search books  
✅ **Student Registration** - Register and manage student accounts  
✅ **Issue & Return Books** - Automated transaction tracking  
✅ **Available Books View** - Browse available books  
✅ **Student Portal** - Dashboard for students to manage their accounts  
✅ **QR Code Generation** - Auto-generated QR codes for books  
✅ **Fine Calculation** - Automatic fine calculation for late returns (₹10/day)  
✅ **Most Read Books** - Analytics showing trending books  
✅ **Chatbot Support** - AI-powered assistant for instant help  
✅ **Transaction History** - Track all issue/return history  
✅ **Overdue Tracking** - Monitor overdue books  

## Project Structure

```
library-management-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Flask app initialization
│   │   ├── models/             # Database models
│   │   │   ├── __init__.py
│   │   │   ├── admin.py       # Admin model
│   │   │   ├── student.py     # Student model
│   │   │   ├── book.py        # Book model
│   │   │   ├── transaction.py # Transaction model
│   │   │   ├── fine.py        # Fine model
│   │   │   └── chatbot.py     # Chatbot message model
│   │   └── routes/             # API routes
│   │       ├── __init__.py
│   │       ├── admin.py       # Admin endpoints
│   │       ├── books.py       # Book endpoints
│   │       ├── students.py    # Student endpoints
│   │       ├── transactions.py# Transaction endpoints
│   │       └── chatbot.py     # Chatbot endpoints
│   ├── config.py              # Configuration settings
│   ├── .env                   # Environment variables
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Application entry point
├── database/
│   └── schema.sql             # Database schema
├── frontend/
│   ├── index.html             # Home page
│   ├── books.html             # Browse books
│   ├── login.html             # Login page
│   ├── register.html          # Student registration
│   ├── dashboard.html         # Student dashboard
│   ├── admin-dashboard.html   # Admin dashboard
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   └── js/
│       ├── main.js            # Common functionality
│       ├── auth.js            # Authentication logic
│       ├── books.js           # Book page logic
│       ├── dashboard.js       # Student dashboard logic
│       └── admin.js           # Admin dashboard logic
└── README.md
```

## Tech Stack

- **Backend:** Flask (Python)
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript
- **Authentication:** JWT (JSON Web Tokens)
- **QR Code Generation:** Python qrcode library
- **ORM:** SQLAlchemy

## Installation & Setup

### Prerequisites
- Python 3.8+
- MySQL Server
- pip (Python package manager)

### Step 1: Setup Database

1. Create MySQL database:
```bash
mysql -u root -p < database/schema.sql
```

2. Or manually create the database:
```sql
CREATE DATABASE IF NOT EXISTS library_management;
```

### Step 2: Setup Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Update `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_management
JWT_SECRET_KEY=your_secret_key
JWT_ACCESS_TOKEN_EXPIRES=3600
```

5. Run the Flask server:
```bash
python run.py
```

The backend API will be available at `http://localhost:5000`

### Step 3: Setup Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Open any HTML file in a web browser:
```bash
# Windows
start index.html

# Linux/Mac
open index.html
```

Or use a simple HTTP server:
```bash
python -m http.server 8000
```

Then access at `http://localhost:8000`

## API Endpoints

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `POST /register` - Register new admin
- `GET /profile` - Get admin profile
- `PUT /profile` - Update admin profile

### Books Routes (`/api/books`)
- `GET /` - Get all books (paginated)
- `GET /<id>` - Get book by ID
- `GET /search?q=<query>` - Search books
- `POST /` - Add new book (requires auth)
- `PUT /<id>` - Update book (requires auth)
- `DELETE /<id>` - Delete book (requires auth)
- `GET /most-read` - Get most read books
- `GET /available` - Get available books

### Students Routes (`/api/students`)
- `GET /` - Get all students (requires auth)
- `GET /<id>` - Get student by ID
- `GET /email/<email>` - Get student by email
- `POST /register` - Register new student
- `PUT /<id>` - Update student profile (requires auth)
- `DELETE /<id>` - Deactivate student (requires auth)

### Transactions Routes (`/api/transactions`)
- `POST /issue` - Issue book to student (requires auth)
- `POST /return/<id>` - Return book (requires auth)
- `GET /student/<id>/active` - Get active books for student
- `GET /student/<id>/history` - Get transaction history
- `GET /overdue` - Get overdue books (requires auth)
- `GET /<id>` - Get transaction details
- `POST /fine/pay/<id>` - Pay fine (requires auth)
- `GET /fine/student/<id>` - Get fines for student

### Chatbot Routes (`/api/chatbot`)
- `POST /message` - Send message to chatbot
- `GET /chat-history/<id>` - Get chat history for student

## Usage Examples

### Admin Login
```javascript
POST http://localhost:5000/api/admin/login
{
    "username": "admin",
    "password": "password123"
}
```

### Register Student
```javascript
POST http://localhost:5000/api/students/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "enrollment_number": "CSE001",
    "department": "CS",
    "semester": 4
}
```

### Add Book
```javascript
POST http://localhost:5000/api/books
Headers: Authorization: Bearer <token>
{
    "title": "Python Programming",
    "author": "Guido van Rossum",
    "isbn": "978-0-123456-78-9",
    "publisher": "O'Reilly",
    "publication_year": 2020,
    "category": "Programming",
    "total_copies": 5,
    "available_copies": 3,
    "location": "Section A",
    "price": 450.00
}
```

### Issue Book
```javascript
POST http://localhost:5000/api/transactions/issue
Headers: Authorization: Bearer <token>
{
    "book_id": 1,
    "student_id": 1
}
```

### Return Book
```javascript
POST http://localhost:5000/api/transactions/return/1
Headers: Authorization: Bearer <token>
```

## Fine Calculation

- Fine is calculated at ₹10 per day
- Fine is auto-calculated when a book is returned after the due date
- Due date is automatically set to 14 days from issue date

## Chatbot Features

The chatbot can help with:
- Searching books by title/author
- Checking pending fines
- Viewing issued books
- Checking transaction history
- General library information

## Default Admin Credentials

Create admin account by running:
```bash
cd backend
python
```

Then:
```python
from app import create_app, db
from app.models.admin import Admin

app = create_app()
with app.app_context():
    admin = Admin(username='admin', email='admin@library.edu')
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    print("Admin created successfully")
```

## QR Code Features

- Automatic QR code generation for each book
- QR code contains book ISBN/ID
- QR codes can be printed and attached to books

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- Email notifications for overdue books
- SMS alerts for fines
- Mobile app development
- Advanced analytics dashboard
- Payment gateway integration
- Book reservations system
- Multi-language support
- Advanced book recommendation engine

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env` file
- Ensure database is created

### API not responding
- Check backend server is running (`python run.py`)
- Verify API URL in frontend (`http://localhost:5000/api`)

### CORS errors
- Ensure backend is running on `localhost:5000`
- Update CORS headers if needed in backend

## Support

For issues or questions, please create an issue in the repository or contact support@library.edu

## License

This project is licensed under the MIT License - see LICENSE.md file for details.

## Author

Library Management System Development Team

---

**Last Updated:** March 2026
