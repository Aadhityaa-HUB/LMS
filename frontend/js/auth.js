// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

function showTab(tabName) {
    const adminTab = document.getElementById('adminTab');
    const studentTab = document.getElementById('studentTab');
    const buttons = document.querySelectorAll('.tab-btn');
    
    if (tabName === 'admin') {
        adminTab.classList.add('active');
        studentTab.classList.remove('active');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        studentTab.classList.add('active');
        adminTab.classList.remove('active');
        buttons[1].classList.add('active');
        buttons[0].classList.remove('active');
    }
}

async function adminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const data = await fetchAPI('/admin/login', 'POST', {
            username,
            password
        });
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userId', data.admin.admin_id);
        localStorage.setItem('userType', 'admin');
        
        showNotification('Login successful', 'success');
        window.location.href = 'admin-dashboard.html';
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
}

async function studentLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('studentEmail').value;
    const studentId = document.getElementById('studentId').value;
    
    try {
        // Access student data
        const data = await fetchAPI(`/students/email/${email}`);
        
        if (data.student_id === parseInt(studentId)) {
            localStorage.setItem('userId', data.student_id);
            localStorage.setItem('userType', 'student');
            localStorage.setItem('studentEmail', data.email);
            
            showNotification('Login successful', 'success');
            window.location.href = 'dashboard.html';
        } else {
            showNotification('Invalid student ID', 'error');
        }
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
}

async function registerStudent(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const enrollmentNumber = document.getElementById('enrollmentNumber').value;
    const department = document.getElementById('department').value;
    const semester = document.getElementById('semester').value;
    
    try {
        const data = await fetchAPI('/students/register', 'POST', {
            name,
            email,
            phone,
            enrollment_number: enrollmentNumber,
            department,
            semester: parseInt(semester)
        });
        
        localStorage.setItem('userId', data.student.student_id);
        localStorage.setItem('userType', 'student');
        localStorage.setItem('studentEmail', data.student.email);
        
        showNotification('Registration successful', 'success');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showNotification(error.message || 'Registration failed', 'error');
    }
}
