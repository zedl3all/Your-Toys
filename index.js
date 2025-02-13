// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// เพิ่มใช้งานไฟล์
const conn = require('./dbconn.js');

// static resourse & template engine
app.use(express.static('Public/Login'));
app.use(express.static('Asset'));
// routing 
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "/Public/Login/login.html"));
});


app.listen(port, () => {
    console.log(`listening to port ${port}`);
}); 