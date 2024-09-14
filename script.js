// Assume user is logged in and we have their userId stored
const userId = 1; 

// Fetch previous performance data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    fetch(`/dashboard-data/${userId}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(row => {
                addRowToTable(row.business_name, row.income, row.expenses, row.profit, new Date(row.date).toLocaleDateString());
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Handling form submission
document.getElementById('performance-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const businessName = document.getElementById('business-name').value;
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    const profit = income - expenses;

    fetch('/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, business_name: businessName, income: income, expenses: expenses, profit: profit })
    })
    .then(response => response.json())
    .then(data => {
        // Add the new entry to the table
        addRowToTable(businessName, income, expenses, profit, new Date().toLocaleDateString());

        // Reset the form fields after submission
        document.getElementById('business-name').value = '';
        document.getElementById('income').value = '';
        document.getElementById('expenses').value = '';

        // Show success message
        authmsg('Data submitted successfully!');
    })
    .catch(error => {
        console.error('Error submitting data:', error);
        authmsg('Error submitting data!');
    });
});

// Function to add a row to the performance table
function addRowToTable(businessName, income, expenses, profit, date) {
    const tableBody = document.querySelector('#performance-table tbody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${businessName}</td>
        <td>${income}</td>
        <td>${expenses}</td>
        <td>${profit}</td>
        <td>${date}</td> <!-- Date column -->
    `;
    
    tableBody.appendChild(row);
}

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', () => {
    fetch('/logout')
      .then(() => {
        window.location.href = '/';
      })
      .catch((error) => console.error('Logout Error:', error));
});

// Function to show messages 
function authmsg(message) {
    const messageDiv = document.getElementById('authmsg');
    messageDiv.innerText = message;
    messageDiv.style.display = 'block'; 
    setTimeout(() => {
      messageDiv.style.display = 'none'; // Hide the message after 3 seconds
    }, 3000);
}

// Function to display success messages after login or registration
function displayMessage() {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    if (message) {
      const messageDiv = document.querySelector('.message');
      messageDiv.innerText = message;
      messageDiv.style.display = 'block';
      setTimeout(() => {
        messageDiv.style.display = 'none'; // Hide after 3 seconds
      }, 3000);
    }
}
window.onload = displayMessage;

// fetch correct user ID after login (ensure login system returns this)
function setUserId(newUserId) {
    userId = newUserId;
}
