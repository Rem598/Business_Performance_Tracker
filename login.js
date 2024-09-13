document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission behavior

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            })
            .then(response => response.json()) // Expecting JSON response
            .then(data => {
                if (data.success) {
                    authmsg(data.message); // Display success message
                    setTimeout(() => {
                        window.location.href = '/dashboard'; // Redirect to dashboard after showing message
                    }, 3000); // Delay redirection to allow message display
                } else {
                    authmsg(data.message); // Display error message
                }
            })
            .catch(err => {
                console.error('Error:', err);
                authmsg('An error occurred');
            });
        });
    } else {
        console.error('Login form not found');
    }

    function authmsg(message) {
        const messageDiv = document.getElementById('authmsg');
        messageDiv.innerText = message;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
});
