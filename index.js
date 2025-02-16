// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// using sqlite3
const sqlite3 = require('sqlite3').verbose();

// using EJS
app.set('view engine', 'ejs');

// Connect to SQLite database
let db = new sqlite3.Database('lala.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

// const conn = require('./dbconn.js');
app.use(express.json());

// static resourse & template engine
app.use('/Asset',express.static(path.join(__dirname, '/Asset')));
app.use(express.static(path.join(__dirname, '/Public')));
app.set('views', path.join(__dirname, 'Views'));

// routing 
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Login/login.html"));
});

app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Register/register.html"));
});

app.post('/validateUser', async (req, res) => {
    const { username, password, userType } = req.body;
    console.log(`Received request to validate ${userType}: ${username}`);
    try {
        let query;
        if (userType === 'employee') {
            query = 'SELECT * FROM employees WHERE employee_username = ? AND employee_password = ?';
        } else if (userType === 'customer') {
            query = 'SELECT * FROM customers WHERE customer_username = ? AND customer_password = ?';
        } else {
            res.status(400).json({ error: 'Invalid user type' });
            return;
        }
        console.log(`Executing query: ${query} with parameters: ${username}, ${password}`);
        db.get(query, [username, password], (error, row) => {
            if (error) {
                console.error(`Error executing query: ${error.message}`);
                res.status(500).json(false);
            } else if (row) {
                console.log(`${userType} ${username} validated successfully.`);
                res.json(true);
            } else {
                console.log(`${userType} ${username} validation failed.`);
                res.json(false);
            }
        });
    } catch (error) {
        console.error(`Caught error: ${error.message}`);
        res.status(500).json(false);
    }
});

app.get('/test', (req, res) => { // test
    res.render('Test/index');
});

// 404 Not Found routing
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'Public/404.html'));
});

// start server
app.post('/registerUser', async (req, res) => {
    const { username, password, firstName, lastName, email, address, phone } = req.body;
    try {
        const query = 'INSERT INTO users (username, password, first_name, last_name, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
        conn.query(query, [username, password, firstName, lastName, email, address, phone], (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Registration failed' });
            } else {
                res.json({ success: true, message: 'User registered successfully' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});