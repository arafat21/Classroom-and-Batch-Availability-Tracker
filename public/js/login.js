const API_BASE_URL = window.location.origin;

async function submitLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

function storeToken(token, userData) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
}

function redirectUser(role) {
    if (role === 'student') {
        window.location.href = '/pages/studentDashboard.html';
    } else if (role === 'teacher') {
        window.location.href = '/pages/teacherDashboard.html';
    } else if (role === 'admin') {
        window.location.href = '/pages/adminDashboard.html';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Disable submit button during request
    const submitBtn = document.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        const result = await submitLogin(email, password);
        
        if (result.success && result.token) {
            storeToken(result.token, result.user);
            redirectUser(result.user.role);
        } else {
            showError('Invalid response from server');
        }
    } catch (error) {
        showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Check if user is already logged in
function checkExistingSession() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            redirectUser(user.role);
        } catch (e) {
            localStorage.clear();
        }
    }
}

checkExistingSession();