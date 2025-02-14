const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const passwordPath = path.join(__dirname, 'password.json');
const passwordData = JSON.parse(fs.readFileSync(passwordPath, 'utf8'));

const conn = mysql.createConnection({
    host: "10.0.15.21",
    user: passwordData.username,
    password: passwordData.password,
    database: passwordData.database
});

// open the MySQL connection
conn.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

module.exports = conn;