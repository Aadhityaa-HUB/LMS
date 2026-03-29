// Student Dashboard functionality
const studentId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', function() {
    if (!studentId) {
        window.location.href = 'login.html';
        return;
    }
    
    loadIssuedBooks();
    loadStudentFines();
    loadTransactionHistory();
    
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

async function loadIssuedBooks() {
    try {
        const data = await fetchAPI(`/transactions/student/${studentId}/active`);
        displayIssuedBooks(data);
    } catch (error) {
        document.getElementById('issuedBooks').innerHTML = '<p>No books issued.</p>';
    }
}

function displayIssuedBooks(transactions) {
    const container = document.getElementById('issuedBooks');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p>No books currently issued.</p>';
        return;
    }
    
    let html = '<ul style="list-style: none;">';
    
    transactions.forEach(trans => {
        const daysLeft = Math.ceil((new Date(trans.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const dueClass = daysLeft < 3 ? 'style="color: red;"' : '';
        
        html += `
            <li ${dueClass}>
                <strong>Book ID:</strong> ${trans.book_id}<br>
                <strong>Issued:</strong> ${new Date(trans.issue_date).toLocaleDateString()}<br>
                <strong>Due:</strong> ${trans.due_date} (${daysLeft} days left)<br>
                <button class="btn btn-success" onclick="returnBook(${trans.transaction_id})">Return Book</button>
            </li>
            <hr>
        `;
    });
    
    html += '</ul>';
    container.innerHTML = html;
}

async function loadStudentFines() {
    try {
        const data = await fetchAPI(`/transactions/fine/student/${studentId}`);
        displayFines(data);
    } catch (error) {
        document.getElementById('studentFines').innerHTML = '<p>No pending fines.</p>';
    }
}

function displayFines(fines) {
    const container = document.getElementById('studentFines');
    
    if (fines.length === 0) {
        container.innerHTML = '<p style="color: green;">No pending fines.</p>';
        return;
    }
    
    let totalFine = 0;
    let html = '<ul style="list-style: none;">';
    
    fines.forEach(fine => {
        if (fine.payment_status === 'pending') {
            totalFine += fine.amount;
            html += `
                <li>
                    <strong>Amount:</strong> ₹${fine.amount}<br>
                    <strong>Reason:</strong> ${fine.reason}<br>
                    <strong>Status:</strong> ${fine.payment_status}<br>
                    <button class="btn btn-success" onclick="payFine(${fine.fine_id})">Pay Fine</button>
                </li>
                <hr>
            `;
        }
    });
    
    html += `</ul><strong>Total Pending: ₹${totalFine}</strong>`;
    container.innerHTML = html;
}

async function loadTransactionHistory() {
    try {
        const data = await fetchAPI(`/transactions/student/${studentId}/history`);
        displayTransactionHistory(data);
    } catch (error) {
        document.getElementById('transactionHistory').innerHTML = '<p>No transaction history.</p>';
    }
}

function displayTransactionHistory(transactions) {
    const container = document.getElementById('transactionHistory');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p>No transaction history.</p>';
        return;
    }
    
    let html = '<table><tr><th>Book ID</th><th>Issue Date</th><th>Return Date</th><th>Status</th><th>Fine</th></tr>';
    
    transactions.forEach(trans => {
        const returnDate = trans.return_date ? new Date(trans.return_date).toLocaleDateString() : 'N/A';
        
        html += `
            <tr>
                <td>${trans.book_id}</td>
                <td>${new Date(trans.issue_date).toLocaleDateString()}</td>
                <td>${returnDate}</td>
                <td>${trans.status}</td>
                <td>₹${trans.fine_amount}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

async function returnBook(transactionId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/transactions/return/${transactionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Book returned successfully. Fine: ₹${data.fine_amount}`, 'success');
            loadIssuedBooks();
            loadStudentFines();
            loadTransactionHistory();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to return book', 'error');
    }
}

async function payFine(fineId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/transactions/fine/pay/${fineId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Fine paid successfully', 'success');
            loadStudentFines();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to pay fine', 'error');
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    try {
        const data = await fetchAPI('/chatbot/message', 'POST', {
            message,
            student_id: studentId
        });
        
        displayChatMessage('user', message);
        displayChatMessage('bot', data.bot_response);
        
        chatInput.value = '';
    } catch (error) {
        showNotification('Failed to send message', 'error');
    }
}

function displayChatMessage(type, message) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
