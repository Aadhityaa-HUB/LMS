-- Library Management System Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    enrollment_number VARCHAR(50) UNIQUE,
    department VARCHAR(50),
    semester INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publisher VARCHAR(100),
    publication_year INT,
    category VARCHAR(50),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    qr_code VARCHAR(255),
    location VARCHAR(100),
    price DECIMAL(10, 2),
    read_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Issue/Return Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    return_date DATE,
    status ENUM('issued', 'returned', 'overdue') DEFAULT 'issued',
    fine_amount DECIMAL(10, 2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Fine Log Table
CREATE TABLE IF NOT EXISTS fines (
    fine_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    transaction_id INT NOT NULL,
    amount DECIMAL(10, 2),
    reason VARCHAR(255),
    payment_status ENUM('pending', 'paid') DEFAULT 'pending',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
);

-- Chatbot Interactions Table
CREATE TABLE IF NOT EXISTS chatbot_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    user_message TEXT,
    bot_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Most Read Books View
CREATE VIEW IF NOT EXISTS most_read_books AS
SELECT 
    b.book_id,
    b.title,
    b.author,
    b.category,
    COUNT(t.transaction_id) as read_count
FROM books b
LEFT JOIN transactions t ON b.book_id = t.book_id
GROUP BY b.book_id, b.title, b.author, b.category
ORDER BY read_count DESC;

-- Create Indexes for Performance
CREATE INDEX idx_book_title ON books(title);
CREATE INDEX idx_book_author ON books(author);
CREATE INDEX idx_book_category ON books(category);
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_transaction_student ON transactions(student_id);
CREATE INDEX idx_transaction_book ON transactions(book_id);
CREATE INDEX idx_transaction_status ON transactions(status);
