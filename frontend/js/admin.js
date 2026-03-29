// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    loadDashboardStats();
});

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
        
        // Load data based on tab
        if (tabName === 'dashboard') {
            loadDashboardStats();
        } else if (tabName === 'books') {
            loadBooks();
        } else if (tabName === 'students') {
            loadStudents();
        } else if (tabName === 'transactions') {
            loadTransactions();
        } else if (tabName === 'overdue') {
            loadOverdueBooks();
        } else if (tabName === 'fines') {
            loadFines();
        }
    }
}

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch total books
        const booksData = await fetchAPI('/books/');
        document.getElementById('totalBooks').textContent = booksData.total;
        
        // Fetch total students
        const studentsData = await fetchAPI('/students/');
        document.getElementById('totalStudents').textContent = studentsData.total;
        
        // Fetch active transactions
        const transData = await fetchAPI('/transactions/');
        const activeTransactions = transData.filter(t => t.status === 'issued').length;
        document.getElementById('activeIssuances').textContent = activeTransactions;
        
        // Fetch pending fines
        const overdueData = await fetchAPI('/transactions/overdue');
        document.getElementById('pendingFines').textContent = overdueData.length;
        
    } catch (error) {
        console.error('Failed to load dashboard stats', error);
    }
}

async function loadBooks() {
    try {
        const data = await fetchAPI('/books/');
        displayBooksTable(data.books);
    } catch (error) {
        showNotification('Failed to load books', 'error');
    }
}

function displayBooksTable(books) {
    const container = document.getElementById('booksContainer');
    
    let html = `
        <table>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Total</th>
                <th>Available</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
    `;
    
    books.forEach(book => {
        html += `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.total_copies}</td>
                <td>${book.available_copies}</td>
                <td><button class="btn btn-primary" onclick="editBook(${book.book_id})">Edit</button></td>
                <td><button class="btn btn-danger" onclick="deleteBook(${book.book_id})">Delete</button></td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

async function loadStudents() {
    try {
        const data = await fetchAPI('/students/');
        displayStudentsTable(data.students);
    } catch (error) {
        showNotification('Failed to load students', 'error');
    }
}

function displayStudentsTable(students) {
    const container = document.getElementById('studentsContainer');
    
    let html = `
        <table>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Enrollment</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
    `;
    
    students.forEach(student => {
        html += `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.enrollment_number}</td>
                <td>${student.department}</td>
                <td>${student.status}</td>
                <td><button class="btn btn-primary" onclick="viewStudent(${student.student_id})">View</button></td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

async function loadTransactions() {
    try {
        const data = await fetchAPI('/transactions/');
        displayTransactionsTable(data);
    } catch (error) {
        showNotification('Failed to load transactions', 'error');
    }
}

function displayTransactionsTable(transactions) {
    const container = document.getElementById('transactionsContainer');
    
    let html = `
        <table>
            <tr>
                <th>Transaction ID</th>
                <th>Book ID</th>
                <th>Student ID</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
            </tr>
    `;
    
    transactions.forEach(trans => {
        html += `
            <tr>
                <td>${trans.transaction_id}</td>
                <td>${trans.book_id}</td>
                <td>${trans.student_id}</td>
                <td>${new Date(trans.issue_date).toLocaleDateString()}</td>
                <td>${trans.due_date}</td>
                <td>${trans.status}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

async function loadOverdueBooks() {
    try {
        const data = await fetchAPI('/transactions/overdue');
        displayOverdueTable(data);
    } catch (error) {
        showNotification('Failed to load overdue books', 'error');
    }
}

function displayOverdueTable(overdueBooks) {
    const container = document.getElementById('overdueContainer');
    
    if (overdueBooks.length === 0) {
        container.innerHTML = '<p>No overdue books.</p>';
        return;
    }
    
    let html = `
        <table>
            <tr>
                <th>Book ID</th>
                <th>Student ID</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Fine Amount</th>
            </tr>
    `;
    
    overdueBooks.forEach(book => {
        const daysOverdue = Math.floor((new Date() - new Date(book.due_date)) / (1000 * 60 * 60 * 24));
        html += `
            <tr>
                <td>${book.book_id}</td>
                <td>${book.student_id}</td>
                <td>${book.due_date}</td>
                <td>${daysOverdue}</td>
                <td>₹${book.fine_amount}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

async function loadFines() {
    try {
        const data = await fetchAPI('/transactions/fines');
        displayFinesTable(data);
    } catch (error) {
        showNotification('Failed to load fines', 'error');
    }
}

function displayFinesTable(fines) {
    const container = document.getElementById('finesContainer');
    
    let html = `
        <table>
            <tr>
                <th>Fine ID</th>
                <th>Student ID</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
            </tr>
    `;
    
    fines.forEach(fine => {
        html += `
            <tr>
                <td>${fine.fine_id}</td>
                <td>${fine.student_id}</td>
                <td>₹${fine.amount}</td>
                <td>${fine.reason}</td>
                <td>${fine.payment_status}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

// Edit/delete/add operations
function editBook(bookId) {
    const newTitle = prompt('Enter new title (leave blank to keep):');
    const newAuthor = prompt('Enter new author (leave blank to keep):');
    const newCopies = prompt('Enter total copies (leave blank to keep):');

    const updateData = {};
    if (newTitle && newTitle.trim()) updateData.title = newTitle.trim();
    if (newAuthor && newAuthor.trim()) updateData.author = newAuthor.trim();
    if (newCopies && !isNaN(newCopies)) updateData.total_copies = parseInt(newCopies);

    if (Object.keys(updateData).length === 0) {
        showNotification('No changes made', 'error');
        return;
    }

    fetchAPI(`/books/${bookId}`, 'PUT', updateData)
        .then(() => {
            showNotification('Book updated successfully', 'success');
            loadBooks();
        })
        .catch(err => showNotification(err.message || 'Failed to update book', 'error'));
}

function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        fetchAPI(`/books/${bookId}`, 'DELETE')
            .then(() => {
                showNotification('Book deleted successfully', 'success');
                loadBooks();
            })
            .catch(err => showNotification(err.message || 'Failed to delete book', 'error'));
    }
}

function viewStudent(studentId) {
    fetchAPI(`/students/${studentId}`)
        .then(student => {
            alert(`Student Details:\nName: ${student.name}\nEmail: ${student.email}\nEnrollment: ${student.enrollment_number || 'N/A'}\nDepartment: ${student.department || 'N/A'}\nSemester: ${student.semester || 'N/A'}\nStatus: ${student.status}`);
        })
        .catch(err => showNotification('Failed to load student', 'error'));
}

function showAddBookForm() {
    const title = prompt('Book Title (required):');
    if (!title || !title.trim()) { showNotification('Title is required', 'error'); return; }

    const author = prompt('Author (required):');
    if (!author || !author.trim()) { showNotification('Author is required', 'error'); return; }

    const isbn = prompt('ISBN (optional):');
    const publisher = prompt('Publisher (optional):');
    const year = prompt('Publication Year (optional):');
    const category = prompt('Category (optional):');
    const copies = prompt('Total Copies (default 1):') || '1';
    const price = prompt('Price (optional):');
    const location = prompt('Location/Shelf (optional):');

    const bookData = {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn || undefined,
        publisher: publisher || undefined,
        publication_year: year ? parseInt(year) : undefined,
        category: category || undefined,
        total_copies: parseInt(copies) || 1,
        available_copies: parseInt(copies) || 1,
        price: price ? parseFloat(price) : undefined,
        location: location || undefined
    };

    fetchAPI('/books/', 'POST', bookData)
        .then(() => {
            showNotification('Book added successfully!', 'success');
            loadBooks();
        })
        .catch(err => showNotification(err.message || 'Failed to add book', 'error'));
}
