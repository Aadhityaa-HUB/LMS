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
    
    if (books.length === 0) {
        container.innerHTML = '<p>No books found. Click "Add New Book" to add one.</p>';
        return;
    }
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Available</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    books.forEach(book => {
        html += `
            <tr>
                <td>${book.title || 'N/A'}</td>
                <td>${book.author || 'N/A'}</td>
                <td>${book.isbn || 'N/A'}</td>
                <td>${book.category || 'N/A'}</td>
                <td>${book.total_copies || 0}</td>
                <td><span class="badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}">${book.available_copies || 0}</span></td>
                <td>$${book.price || '0.00'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editBook(${book.book_id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.book_id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    container.innerHTML = html;
}

// ===== MANAGE BOOKS FUNCTIONS =====

let currentEditingBookId = null;

function showAddBookForm() {
    currentEditingBookId = null;
    showBookFormModal(null);
}

function editBook(bookId) {
    currentEditingBookId = bookId;
    // Fetch book details
    fetchAPI(`/books/${bookId}`)
        .then(book => showBookFormModal(book))
        .catch(error => showNotification('Failed to load book details', 'error'));
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/books/${bookId}`, 'DELETE');
        showNotification('Book deleted successfully!', 'success');
        loadBooks();
    } catch (error) {
        showNotification('Failed to delete book. ' + error.message, 'error');
    }
}

function showBookFormModal(book) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'bookFormModal';
    
    const isEdit = book !== null;
    const title = isEdit ? 'Edit Book' : 'Add New Book';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeBookFormModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="bookForm" onsubmit="handleBookFormSubmit(event)">
                    <div class="form-group">
                        <label for="bookTitle">Book Title *</label>
                        <input type="text" id="bookTitle" name="title" required value="${book?.title || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="bookAuthor">Author *</label>
                        <input type="text" id="bookAuthor" name="author" required value="${book?.author || ''}">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bookISBN">ISBN</label>
                            <input type="text" id="bookISBN" name="isbn" value="${book?.isbn || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="bookCategory">Category</label>
                            <input type="text" id="bookCategory" name="category" value="${book?.category || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bookPublisher">Publisher</label>
                            <input type="text" id="bookPublisher" name="publisher" value="${book?.publisher || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="bookYear">Publication Year</label>
                            <input type="number" id="bookYear" name="publication_year" value="${book?.publication_year || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bookTotal">Total Copies *</label>
                            <input type="number" id="bookTotal" name="total_copies" min="1" required value="${book?.total_copies || 1}">
                        </div>
                        
                        <div class="form-group">
                            <label for="bookAvailable">Available Copies *</label>
                            <input type="number" id="bookAvailable" name="available_copies" min="0" required value="${book?.available_copies || 0}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bookPrice">Price ($)</label>
                            <input type="number" id="bookPrice" name="price" step="0.01" value="${book?.price || '0.00'}">
                        </div>
                        
                        <div class="form-group">
                            <label for="bookLocation">Location</label>
                            <input type="text" id="bookLocation" name="location" value="${book?.location || ''}">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">${isEdit ? 'Update Book' : 'Add Book'}</button>
                        <button type="button" class="btn btn-secondary" onclick="closeBookFormModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeBookFormModal();
        }
    });
}

function closeBookFormModal() {
    const modal = document.getElementById('bookFormModal');
    if (modal) {
        modal.remove();
    }
    currentEditingBookId = null;
}

async function handleBookFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in again (session expired)', 'error');
        return;
    }
    
    const title = form.title.value.trim();
    const author = form.author.value.trim();
    if (!title || !author) {
        showNotification('Title and Author are required', 'error');
        return;
    }

    let totalCopies = parseInt(form.total_copies.value, 10);
    if (Number.isNaN(totalCopies) || totalCopies < 1) totalCopies = 1;

    let availableCopies = parseInt(form.available_copies.value, 10);
    if (Number.isNaN(availableCopies) || availableCopies < 0) availableCopies = 0;
    if (availableCopies > totalCopies) availableCopies = totalCopies;

    const formData = {
        title,
        author,
        total_copies: totalCopies,
        available_copies: availableCopies
    };
    
    // Add optional fields only if they have values
    if (form.isbn.value.trim()) {
        formData.isbn = form.isbn.value.trim();
    }
    if (form.category.value.trim()) {
        formData.category = form.category.value.trim();
    }
    if (form.publisher.value.trim()) {
        formData.publisher = form.publisher.value.trim();
    }
    if (form.publication_year.value) {
        formData.publication_year = parseInt(form.publication_year.value);
    }
    if (form.price.value) {
        const price = parseFloat(form.price.value);
        if (!Number.isNaN(price)) {
            formData.price = price;
        }
    }
    if (form.location.value.trim()) {
        formData.location = form.location.value.trim();
    }
    
    try {
        let response;
        if (currentEditingBookId) {
            // Update existing book
            response = await fetchAPI(`/books/${currentEditingBookId}`, 'PUT', formData);
            showNotification('Book updated successfully!', 'success');
        } else {
            // Add new book
            response = await fetchAPI('/books/', 'POST', formData);
            showNotification('Book added successfully!', 'success');
        }
        
        closeBookFormModal();
        loadBooks();
    } catch (error) {
        showNotification('Error saving book: ' + error.message, 'error');
    }
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
    
    if (!students || students.length === 0) {
        container.innerHTML = '<p>No students found. Click "Add Student" to add one.</p>';
        return;
    }
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrollment</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    students.forEach(student => {
        html += `
            <tr>
                <td>${student.name || 'N/A'}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.enrollment_number || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.semester || 'N/A'}</td>
                <td><span class="badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}">${student.status || 'unknown'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewStudent(${student.student_id})">View</button>
                    <button class="btn btn-sm btn-success" onclick="editStudent(${student.student_id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.student_id})">Deactivate</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== MANAGE STUDENTS FUNCTIONS =====
let currentEditingStudentId = null;

function showAddStudentForm() {
    currentEditingStudentId = null;
    showStudentFormModal(null);
}

function viewStudent(studentId) {
    fetchAPI(`/students/${studentId}`)
        .then(student => showStudentDetailModal(student))
        .catch(() => showNotification('Failed to load student details', 'error'));
}

function editStudent(studentId) {
    currentEditingStudentId = studentId;
    fetchAPI(`/students/${studentId}`)
        .then(student => showStudentFormModal(student))
        .catch(() => showNotification('Failed to load student for edit', 'error'));
}

async function deleteStudent(studentId) {
    if (!confirm('Deactivate this student?')) return;
    try {
        await fetchAPI(`/students/${studentId}`, 'DELETE');
        showNotification('Student deactivated', 'success');
        loadStudents();
    } catch (error) {
        showNotification(error.message || 'Failed to deactivate student', 'error');
    }
}

function showStudentFormModal(student) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'studentFormModal';
    const isEdit = !!student;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${isEdit ? 'Edit Student' : 'Add Student'}</h2>
                <button class="modal-close" onclick="closeStudentFormModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="studentForm" onsubmit="handleStudentFormSubmit(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentName">Name *</label>
                            <input type="text" id="studentName" name="name" required value="${student?.name || ''}">
                        </div>
                        <div class="form-group">
                            <label for="studentEmail">Email *</label>
                            <input type="email" id="studentEmail" name="email" required value="${student?.email || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentPhone">Phone</label>
                            <input type="text" id="studentPhone" name="phone" value="${student?.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="studentEnrollment">Enrollment No.</label>
                            <input type="text" id="studentEnrollment" name="enrollment_number" value="${student?.enrollment_number || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="studentDept">Department</label>
                            <input type="text" id="studentDept" name="department" value="${student?.department || ''}">
                        </div>
                        <div class="form-group">
                            <label for="studentSemester">Semester</label>
                            <input type="number" id="studentSemester" name="semester" min="1" value="${student?.semester || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="studentStatus">Status</label>
                        <select id="studentStatus" name="status">
                            <option value="active" ${!student || student?.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${student?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">${isEdit ? 'Update' : 'Add'}</button>
                        <button type="button" class="btn btn-secondary" onclick="closeStudentFormModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeStudentFormModal();
    });
}

function closeStudentFormModal() {
    const modal = document.getElementById('studentFormModal');
    if (modal) modal.remove();
    currentEditingStudentId = null;
}

async function handleStudentFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    if (!name || !email) {
        showNotification('Name and Email are required', 'error');
        return;
    }
    const payload = { name, email };
    if (form.phone.value.trim()) payload.phone = form.phone.value.trim();
    if (form.enrollment_number.value.trim()) payload.enrollment_number = form.enrollment_number.value.trim();
    if (form.department.value.trim()) payload.department = form.department.value.trim();
    if (form.semester.value) payload.semester = parseInt(form.semester.value, 10);
    if (form.status.value) payload.status = form.status.value;

    try {
        if (currentEditingStudentId) {
            await fetchAPI(`/students/${currentEditingStudentId}`, 'PUT', payload);
            showNotification('Student updated', 'success');
        } else {
            await fetchAPI('/students/register', 'POST', payload);
            showNotification('Student added', 'success');
        }
        closeStudentFormModal();
        loadStudents();
    } catch (error) {
        showNotification(error.message || 'Failed to save student', 'error');
    }
}

function showStudentDetailModal(student) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'studentDetailModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Student Details</h2>
                <button class="modal-close" onclick="closeStudentDetailModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Name:</strong> ${student.name}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Enrollment:</strong> ${student.enrollment_number || 'N/A'}</p>
                <p><strong>Department:</strong> ${student.department || 'N/A'}</p>
                <p><strong>Semester:</strong> ${student.semester || 'N/A'}</p>
                <p><strong>Status:</strong> ${student.status}</p>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="closeStudentDetailModal(); editStudent(${student.student_id});">Edit</button>
                    <button class="btn btn-secondary" onclick="closeStudentDetailModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeStudentDetailModal();
    });
}

function closeStudentDetailModal() {
    const modal = document.getElementById('studentDetailModal');
    if (modal) modal.remove();
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

// Edit/delete/add operations removed - using modal forms instead (see manage books section above)
