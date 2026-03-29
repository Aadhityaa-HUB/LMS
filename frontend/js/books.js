// Books page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadAllBooks();
});

async function loadAllBooks() {
    try {
        const data = await fetchAPI('/books');
        displayBooks(data.books);
    } catch (error) {
        showNotification('Failed to load books', 'error');
    }
}

function displayBooks(books) {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '';
    
    if (books.length === 0) {
        container.innerHTML = '<p>No books found.</p>';
        return;
    }
    
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        const availability = book.available_copies > 0 
            ? `Available: ${book.available_copies}`
            : 'Out of Stock';
        
        const availabilityClass = book.available_copies > 0 
            ? 'book-availability'
            : 'book-availability unavailable';
        
        card.innerHTML = `
            <div class="book-card-header">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
            </div>
            <div class="book-card-body">
                <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
                <p><strong>Category:</strong> ${book.category || 'N/A'}</p>
                <p><strong>Publisher:</strong> ${book.publisher || 'N/A'}</p>
                <p><strong>Year:</strong> ${book.publication_year || 'N/A'}</p>
                <p><strong>Total Copies:</strong> ${book.total_copies}</p>
                <div class="${availabilityClass}">${availability}</div>
                ${book.available_copies > 0 ? `<button class="btn btn-primary" onclick="issueBook(${book.book_id})">Issue Book</button>` : ''}
            </div>
        `;
        
        container.appendChild(card);
    });
}

async function searchBooks() {
    const query = document.getElementById('searchInput').value;
    
    if (!query) {
        loadAllBooks();
        return;
    }
    
    try {
        const data = await fetchAPI(`/books/search?q=${encodeURIComponent(query)}`);
        displayBooks(data);
    } catch (error) {
        showNotification('Search failed', 'error');
    }
}

async function filterByAvailability() {
    try {
        const data = await fetchAPI('/books/available');
        displayBooks(data);
    } catch (error) {
        showNotification('Failed to load available books', 'error');
    }
}

async function filterByMostRead() {
    try {
        const data = await fetchAPI('/books/most-read?limit=20');
        displayBooks(data);
    } catch (error) {
        showNotification('Failed to load most read books', 'error');
    }
}

function issueBook(bookId) {
    const studentId = localStorage.getItem('userId');
    
    if (!studentId) {
        showNotification('Please login first', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    // In production, this would show a modal for confirmation
    const token = localStorage.getItem('token');
    
    fetch(`${API_URL}/transactions/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            book_id: bookId,
            student_id: parseInt(studentId)
        })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Book issued successfully', 'success');
        loadAllBooks();
    })
    .catch(error => {
        showNotification('Failed to issue book', 'error');
        console.error(error);
    });
}
