document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission behavior

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, email: email, password: password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    authmsg('Registration successful! Redirecting to login...');

                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    // Show error message
                    authmsg(data.message);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                authmsg('An error occurred during registration.');
            });
        });
    } else {
        console.error('Register form not found');
    }

    // Function to dynamically show messages (e.g., success messages)
    function authmsg(message) {
        const messageDiv = document.getElementById('authmsg');
        messageDiv.innerText = message;
        messageDiv.style.display = 'block'; // Show the message
        setTimeout(() => {
            messageDiv.style.display = 'none'; // Hide the message after 3 seconds
        }, 3000);
    }
});
