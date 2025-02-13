const mysql = require('mysql');
const conn = mysql.createConnection({
    host: "10.0.15.21",
    user: "s66070xxxx",
    password: "xxxx", 
    database: "d6607xxx"
});

// open the MySQL connection
conn.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

module.exports = conn;