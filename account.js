document.addEventListener('DOMContentLoaded', function() {
    const usernameElem = document.getElementById('username');
    const emailElem = document.getElementById('email');

    // Fetch account details from server
    fetch('/account-details')
        .then(response => {
            if (response.status === 401) {
                throw new Error('Unauthorized access. Please log in.');
            }
            return response.json();
        })
        .then(data => {
            if (data.username && data.email) {
                usernameElem.textContent = data.username;
                emailElem.textContent = data.email;
            } else {
                throw new Error('User details not found');
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            usernameElem.textContent = '';
            emailElem.textContent = '';
        });
});
