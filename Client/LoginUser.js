document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validate form fields
        if (!email || !password ) {
            alert('All fields are required.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password)) {
            alert('Password must be at least 8 characters long.');
            return;
        }
        try {
            const response = await fetch('/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                sessionStorage.setItem('userData', JSON.stringify(userData));
                window.location.href = 'todosUser.html';
            } else {
                alert('Error: Unable to authenticate user.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    })
    
// Function to validate email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Function to validate password
function validatePassword(password) {
    return password.length >= 8;
}
});