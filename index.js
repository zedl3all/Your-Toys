// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const conn = require('./dbconn.js');
app.use(express.json());

// static resourse & template engine
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'Asset')));
// routing 
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Login/login.html"));
});

app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Register/register.html"));
});

app.post('/validateUser', async (req, res) => {
    const { username, password } = req.body;
    try {
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        conn.query(query, [username, password], (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json(false);
            } else if (results.length > 0) {
                res.json(true);
            } else {
                res.json(false);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(false);
    }
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});