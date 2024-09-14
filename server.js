  // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname)); 

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));


// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL server
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  // Create the database if it doesn't exist
  db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err, result) => {
    if (err) throw err;
    console.log(`Database '${process.env.DB_NAME}' created`);

    // Connect to the specific database
    db.changeUser({database: process.env.DB_NAME}, (err) => {
      if (err) throw err;
      console.log(`Connected to the '${process.env.DB_NAME}' database`);

      // Create users table if it doesn't exist
      db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `, (err, result) => {
        if (err) throw err;
        console.log('Users table created ');
      });

      // Create performance table if it doesn't exist
      db.query(`
        CREATE TABLE IF NOT EXISTS performance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          business_name VARCHAR(255) NOT NULL,
          income DECIMAL(10, 2),
          expenses DECIMAL(10, 2),
          profit DECIMAL(10, 2),
          date DATE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err, result) => {
        if (err) throw err;
        console.log('Performance table created ');
      });
    });
  });
});



// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    res.sendFile(__dirname + '/dashboard.html');
  }
});


app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const saltRounds = 10;
  
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.json({ success: false, message: 'Internal server error' });
      }
  
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.json({ success: false, message: 'Error creating user' });
        }
        res.json({ success: true, message: 'User Created Successfully' });
      });
    });
  });
  
  
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.json({ success: false, message: 'Internal server error' });
        }
    
        if (results.length > 0) {
            const user = results[0];
            
            // Compare the hashed password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.json({ success: false, message: 'Internal server error' });
                }
    
                if (isMatch) {
                    req.session.user = user;
                    res.json({ success: true, message: 'Login successful' });
                } else {
                    res.json({ success: false, message: 'Invalid email or password' });
                }
            });
        } else {
            res.json({ success: false, message: 'Invalid email or password' });
        }
    });
});


app.post('/submit-performance', (req, res) => {
  const { businessName, income, expenses, profit } = req.body;
  const userId = req.session.user.id;

  const query = 'INSERT INTO performance (user_id, business_name, income, expenses, profit, date) VALUES (?, ?, ?, ?, ?, NOW())';
  db.query(query, [userId, businessName, income, expenses, profit], (err, result) => {
    if (err) throw err;
    res.redirect('/dashboard');
  });
});

// Handle dashboard form submission
app.post('/dashboard', (req, res) => {
    const { business_name, income, expenses, profit } = req.body;
    const userId = 1; // You can replace this with the actual logged-in user ID from the session

    const query = `INSERT INTO performance (user_id, business_name, income, expenses, profit) 
                   VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [userId, business_name, income, expenses, profit], (err, result) => {
        if (err) {
            console.log('Error inserting data:', err);
            res.status(500).json({ message: 'Error inserting data' });
        } else {
            res.status(200).json({ message: 'Data inserted successfully' });
        }
    });
});

// Endpoint to fetch performance data for logged-in user
app.get('/dashboard-data/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `SELECT * FROM performance WHERE user_id = ? ORDER BY date DESC`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.log('Error fetching data:', err);
            res.status(500).json({ message: 'Error fetching data' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
