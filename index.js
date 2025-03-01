// index.js

const express = require('express');
const path = require('path');
const multer = require("multer");
const fs = require("fs");
const { constant } = require('async');
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
app.use(express.urlencoded({ extended: true }));

// static resource & template engine
const uploadDir = path.join(__dirname, "Asset", "Product");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/Asset', express.static(path.join(__dirname, '/Asset')));
app.use(express.static(path.join(__dirname, '/Public')));
app.use('/Views', express.static(path.join(__dirname, '/Views')));

//Filter for upload image
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only JPG, WEBP, and PNG files are allowed"));
    }
};

app.post("/upload/:imgname", (req, res) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, req.params.imgname + path.extname(file.originalname));
        }
    });
    const upload = multer({ 
        storage,
        fileFilter,
        limits: { fileSize: 300 * 1024 } // 300KB
    });
    upload.single("image")(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File size exceeds the limit of 300KB" });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded or invalid file type" });
        }
        res.json({ message: "File uploaded successfully", filename: req.file.filename });
    });
});

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
        let query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        
        console.log(`Executing query: ${query} with parameters: ${username}, ${password}`);
        db.get(query, [username, password], (error, row) => {
            if (error) {
                console.error(`Error executing query: ${error.message}`);
                res.status(500).json(false);
            } else if (row) {
                console.log(`${userType} ${username} validated successfully.`);
                res.json(row);
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


app.get("/", (req, res) => {
    const categoriesQuery = 'SELECT * FROM categories';
    const productsQuery = 'SELECT * FROM products Join pro_cat ON products.id == pro_cat.p_id ORDER BY c_id, p_id;';

    db.all(categoriesQuery, [], (err, categories) => {
        if (err) {
            console.error(`Error fetching categories: ${err.message}`);
            res.status(500).send('Failed to fetch categories');
            return;
        }

        db.all(productsQuery, [], (err, products) => {
            if (err) {
                console.error(`Error fetching products: ${err.message}`);
                res.status(500).send('Failed to fetch products');
                return;
            }
            
            res.render('Home/home', { categories, products });
        });
    });
});

app.get("/ProductAll", (req, res) => {
    res.redirect('/ProductAll/1');
});

app.get("/ProductAll/:id", (req, res) => {
    const categoriesQuery = 'SELECT * FROM categories';
    const selectcat = `SELECT * FROM categories where categories.id = ${req.params.id}`;
    const productsQuery = `SELECT * FROM products JOIN pro_cat ON products.id == pro_cat.p_id where pro_cat.c_id = ${req.params.id};`;

    db.all(categoriesQuery, [], (err, categories) => {
        if (err) {
            console.error(`Error fetching categories: ${err.message}`);
            res.status(500).send('Failed to fetch categories');
            return;
        }

        db.all(productsQuery, [], (err, products) => {
            if (err) {
                console.error(`Error fetching products: ${err.message}`);
                res.status(500).send('Failed to fetch products');
                return;
            }
            db.all(selectcat, [], (err, cat) => {
                if (err) {
                    console.error(`Error fetching products: ${err.message}`);
                    res.status(500).send('Failed to fetch products');
                    return;
                }
            console.log(cat)
            res.render('ProductAll/ProductAll', { categories, products, cat });
        });
        });
    });
});

// app.get('/', (req, res) => { // test
//     res.render('Home/home');
// });

app.get('/product/:id', (req, res) => { // test
    const id = req.params.id;
    const query = 'SELECT * FROM products WHERE id = ?';
    db.get(query, [id], (err, rows) => {
      if (err) {
        console.log(err.message);
        return res.status(500).send('Database error');
      }
      console.log(rows);
      res.render('Product/product', { data: rows });
    });
});

app.get('/productAll', (req, res) => { // test
    res.render('ProductAll/productAll');
});

app.get('/test', (req, res) => { // test
    res.render('Test/test');
});

//for test cart, for real use, use database//
const cart = [
    { id: 1, name: 'Product 1', price: 100, quantity: 2 },
    { id: 2, name: 'Product 2', price: 200, quantity: 1 }
];

app.get('/cart', (req, res) => {
    // Example cart data
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('Cart/cart', { cart, total });
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
    const { username, password, email, address, phone } = req.body;
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

app.get('/manageProduct', (req, res) => {
    const categoriesQuery = 'SELECT * FROM categories';
    const productsQuery = 'SELECT * FROM products';
    const productCategoriesQuery = `
        SELECT p.id as product_id, c.id as category_id, c.name as category_name 
        FROM products p 
        JOIN pro_cat pc ON p.id = pc.p_id 
        JOIN categories c ON pc.c_id = c.id
    `;
    
    db.all(productsQuery, [], (err, products) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Database error');
        }
        
        db.all(categoriesQuery, [], (err, categories) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Database error');
            }
            
            db.all(productCategoriesQuery, [], (err, productCategories) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send('Database error');
                }
                
                products.forEach(product => {
                    product.categories = productCategories
                        .filter(pc => pc.product_id === product.id)
                        .map(pc => ({ id: pc.category_id, name: pc.category_name }));
                });
                
                console.log(products);
                res.render('ManageProduct/manageProduct', { 
                    data: products,
                    categories: categories 
                });
            });
        });
    });
});

app.get('/manageProduct/:id', (req, res) => {
    const categoriesQuery = 'SELECT * FROM categories';
    const productsQuery = `SELECT * FROM products p JOIN pro_cat pc ON p.id = pc.p_id where pc.c_id = ${req.params.id}`;
    const productCategoriesQuery = `
        SELECT p.id as product_id, c.id as category_id, c.name as category_name 
        FROM products p 
        JOIN pro_cat pc ON p.id = pc.p_id 
        JOIN categories c ON pc.c_id = c.id
    `;
    
    db.all(productsQuery, [], (err, products) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Database error');
        }
        
        db.all(categoriesQuery, [], (err, categories) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Database error');
            }
            
            db.all(productCategoriesQuery, [], (err, productCategories) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send('Database error');
                }
                
                products.forEach(product => {
                    product.categories = productCategories
                        .filter(pc => pc.product_id === product.id)
                        .map(pc => ({ id: pc.category_id, name: pc.category_name }));
                });
                
                console.log(products);
                res.render('ManageProduct/manageProduct', { 
                    data: products,
                    categories: categories 
                });
            });
        });
    });
});

app.get('/manageProduct/product/:id', (req, res) => {
    const id = req.params.id;
    
    const productQuery = 'SELECT * FROM products WHERE id = ?';
    
    const categoriesQuery = `
        SELECT c.id, c.name
        FROM categories c
        JOIN pro_cat pc ON c.id = pc.c_id
        WHERE pc.p_id = ?
    `;
    
    db.get(productQuery, [id], (err, product) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Database error');
        }
        
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        db.all(categoriesQuery, [id], (err, categories) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Database error');
            }
            
            product.categories = categories || [];
            
            console.log(product);
            res.send(JSON.stringify(product));
        });
    });
});

// Update Product
app.put('/manageProduct/products/:id', (req, res) => {
    const id = req.params.id;
    console.log("Received update request:", req.body);
    const { productName, description, price, size, amount, categories } = req.body;
    
    let query = 'UPDATE products SET name = ?, description = ?, price = ?, size = ?, amount = ?';
    let params = [productName, description, price, size, amount];
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.run(query, params, function(err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (categories && Array.isArray(categories)) {
            db.run('DELETE FROM pro_cat WHERE p_id = ?', [id], function(err) {
                if (err) {
                    console.error("Error removing categories:", err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                if (categories.length === 0) {
                    return res.json({ 
                        message: 'Product updated successfully',
                        id: id
                    });
                }
                
                let completed = 0;
                categories.forEach(categoryId => {
                    db.run('INSERT INTO pro_cat (p_id, c_id) VALUES (?, ?)', [id, categoryId], function(err) {
                        completed++;
                        
                        if (err) {
                            console.error("Error adding category:", err.message);
                        }
                        
                        if (completed === categories.length) {
                            res.json({ 
                                message: 'Product and categories updated successfully',
                                id: id
                            });
                        }
                    });
                });
            });
        } else {
            res.json({ 
                message: 'Product updated successfully',
                id: id
            });
        }
    });
});

// Add a new product
// Lack of upload image!!! need someone to add it!!!
app.post("/manageProduct/addProduct", (req, res) => {
    console.log("Received data:", req.body);
    
    const productName = req.body.productName;
    const description = req.body.description;
    const price = req.body.price;
    const amount = req.body.amount;
    const categories = req.body.categories;
    
    let size = "1:1"; // Default
    if (req.body.number_x && req.body.number_y) {
        size = `${req.body.number_x}:${req.body.number_y}`;
    }
    // const defaultImage = "dummy.png";
    const productImagePath = path.join(uploadDir, `${productName}.*`);
    const existingFiles = fs.readdirSync(uploadDir).filter(file => {
        const regex = new RegExp(`^${productName}\\.(jpeg|jpg|png|webp)$`);
        return regex.test(file);
    });
    console.log(existingFiles)
    
    const defaultImage = existingFiles.length > 0 ? existingFiles[0] : "dummy.png";
    const query = `INSERT INTO products (name, description, price, size, amount, image) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [productName, description, price, size, amount, defaultImage], function(err) {
        if (err) {
            console.error("Error adding product:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
        
        const productId = this.lastID;
        console.log(`Added product successfully with ID: ${productId}`);
        
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return res.json({ 
                success: true, 
                message: 'Product added successfully (no categories)',
                productId: productId
            });
        }
        
        let completedCount = 0;
        let errorOccurred = false;
        
        categories.forEach(categoryId => {
            db.run('INSERT INTO pro_cat (p_id, c_id) VALUES (?, ?)', [productId, categoryId], function(err) {
                completedCount++;
                
                if (err) {
                    console.error(`Error adding category ${categoryId} to product ${productId}:`, err.message);
                    errorOccurred = true;
                }
                
                if (completedCount === categories.length) {
                    if (errorOccurred) {
                        return res.json({ 
                            success: true, 
                            warning: 'Product added but some categories failed',
                            productId: productId
                        });
                    } else {
                        return res.json({ 
                            success: true, 
                            message: 'Product and categories added successfully',
                            productId: productId
                        });
                    }
                }
            });
        });
    });
});

app.delete('/manageProduct/product/:id', (req, res) => {
    const id = req.params.id;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        db.run('DELETE FROM pro_cat WHERE p_id = ?', [id], function(err) {
            if (err) {
                console.error("Error deleting from pro_cat:", err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to delete product categories' 
                });
            }
            
            db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
                if (err) {
                    console.error("Error deleting product:", err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to delete product' 
                    });
                }
                
                db.run('COMMIT');
                res.json({ 
                    success: true, 
                    message: 'Product and related data deleted successfully' 
                });
            });
        });
    });
});

app.get('/Packing', (req, res) => {
    res.render('Packing/packing');
});

app.get('/Tracking', (req, res) => {
    res.render('Tracking/tracking');
});

app.get('/AllOrder', (req, res) => {
    res.render('AllOrder/allOrder');
});

// app.get('/categories', (req, res) => {
//     const query = 'SELECT * FROM categories';
//     db.all(query, [], (err, rows) => {
//         if (err) {
//             console.error(`Error fetching categories: ${err.message}`);
//             res.status(500).json({ success: false, message: 'Failed to fetch categories' });
//         } else {
//             res.json({ success: true, categories: rows });
//         }
//     });
// });

app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(`Error fetching products: ${err.message}`);
            res.status(500).json({ success: false, message: 'Failed to fetch products' });
        } else {
            res.json({ success: true, products: rows });
        }
    });
});

// 404 Not Found routing
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'Public/404.html'));
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});