document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const repeatPassword = document.getElementById('repeatPassword').value;
        const userName = document.getElementById('userName').value;

        // Validate form fields
        if (!email || !password || !repeatPassword || !userName) {
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

        if (password !== repeatPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Make POST request to server
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, userName })
            });

            if (response.ok) {
                alert('Registration successful!');
                registrationForm.reset();
                // Navigate to login page
                window.open('LoginUser.html', '_self');
            } else if (response.status === 400) {
                // User already exists
                alert('User already exists. Please use a different email.');
            } else {
                const errorMessage = await response.text();
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});

// Function to validate email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Function to validate password
function validatePassword(password) {
    return password.length >= 8;
}
