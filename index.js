// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// using sqlite3
const sqlite3 = require('sqlite3').verbose();

// using EJS
app.set('view engine', 'ejs');

//db.runo SQLite database
let db = new sqlite3.Database('lala.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

// constdb.runquire('./ddb.run;
app.use(express.json());

// static resource & template engine
app.use('/Asset', express.static(path.join(__dirname, '/Asset')));
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
            query = 'SELECT * FROM users WHERE username = ? AND password = ? AND (role_id = 0 OR role_id = 1 OR role_id = 2)';
        } else if (userType === 'customer') {
            query = 'SELECT * FROM users WHERE username = ? AND password = ?  AND role_id = 3';
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

app.get('/product', (req, res) => { // test
    res.render('Test/product');
});

//for test cart, for real use, use database//
const cart = [
    { id: 1, name: 'Product 1', price: 100, quantity: 2 },
    { id: 2, name: 'Product 2', price: 200, quantity: 1 }
];

app.get('/cart', (req, res) => {
    // Example cart data
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('Test/cart', { cart, total });
});

app.get('/cart/add/:id', (req, res) => {
    const productId = req.params.id;
    // Logic to add product to cart
    // Example: Increase quantity of the product in the cart
    const product = cart.find(item => item.id == productId);
    if (product) {
        product.quantity += 1;
    } else {
        // Add new product to cart if it doesn't exist
        cart.push({ id: productId, name: `Product ${productId}`, price: 100, quantity: 1 });
    }
    res.redirect('/cart');
});

app.get('/cart/remove/:id', (req, res) => {
    const productId = req.params.id;
    // Logic to remove product from cart
    // Example: Decrease quantity of the product in the cart
    const productIndex = cart.findIndex(item => item.id == productId);
    if (productIndex !== -1) {
        if (cart[productIndex].quantity > 1) {
            cart[productIndex].quantity -= 1;
        } else {
            // Remove product from cart if quantity is 1
            cart.splice(productIndex, 1);
        }
    }
    res.redirect('/cart');
});

app.post('/registerUser', async (req, res) => {
    const { username, password, firstName, lastName, email, address, phone } = req.body;
    console.log(`Received registration request for user: ${username}`);
    try {
        const query = 'INSERT INTO users (username, password, role_id, email, address, phone) VALUES (?, ?, 3, ?, ?, ?)';
        db.run(query, [username, password, email, address, phone], (error, results) => {
            if (error) {
                console.error(`Error inserting user: ${error.message}`);
                res.status(500).json({ success: false, message: 'Registration failed' });
            } else {
                console.log(`User ${username} registered successfully.`);
                res.json({ success: true, message: 'User registered successfully' });
            }
        });
    } catch (error) {
        console.error(`Caught error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// 404 Not Found routing
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'Public/404.html'));
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});