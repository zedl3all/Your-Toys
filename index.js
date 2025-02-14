// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// เพิ่มใช้งานไฟล์
//const conn = require('./dbconn.js');

// static resourse & template engine
app.use(express.static(path.join(__dirname, 'Public/Login')));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'Asset')));
// routing 
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Login/login.html"));
});

app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Register/register.html"));
});


app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 