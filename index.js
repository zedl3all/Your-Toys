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
        limits: { fileSize: 25 * 1024 * 1024 } // 25MB
    });
    upload.single("image")(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File size exceeds the limit of 25MB" });
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
    console.log(`Validating ${userType}: ${username}`);
    try {
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        db.get(query, [username, password], (error, row) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.json({ success: false, message: "Database error" });
            } 
            
            if (row) {
                console.log(`Login successful for: ${username}`);
                console.log("User data being sent:", { 
                    success: true,
                    user_id: row.user_id,
                    username: row.username,
                    role_id: row.role_id
                });
                
                return res.json({
                    success: true,
                    user_id: row.user_id,
                    username: row.username,
                    role_id: row.role_id
                });
            } else {
                console.log(`Invalid login: ${username}`);
                return res.json({ success: false, message: "Invalid credentials" });
            }
        });
    } catch (error) {
        console.error(`Exception: ${error.message}`);
        return res.json({ success: false, message: "Server error" });
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

app.get('/cart', (req, res) => {
    const userId = req.query.userId;
    console.log(`Cart request for userId: ${userId}`);
    
    if (!userId) {
        return res.render('Cart/cart', { 
            cart: [],
            total: 0,
            message: "Please log in to view your cart"
        });
    }
    
    const query = `
        SELECT o.order_id, o.product_id, p.name, p.price, o.amount as quantity, p.image 
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.customer_id = ? AND o.status_id = 0
    `;
    
    db.all(query, [userId], (err, items) => {
        if (err) {
            console.log('Database error:', err.message);
            return res.status(500).send('Database error');
        }
        
        let total = 0;
        if (items && items.length > 0) {
            total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        
        res.render('Cart/cart', {
            cart: items || [],
            total: total,
            userId: userId,
            message: (items && items.length === 0) ? "Your cart is empty" : null
        });
    });
});

app.get('/cart/add/:id', (req, res) => {
    const productId = req.params.id;
    const userId = req.query.userId;
    
    if (!userId) {
        return res.redirect('/login');
    }
    
    // First check if item exists in cart
    const checkQuery = 'SELECT * FROM orders WHERE customer_id = ? AND product_id = ? AND status_id = 0';
    
    db.get(checkQuery, [userId, productId], (err, row) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Database error');
        }
        
        if (row) {
            const updateQuery = 'UPDATE orders SET amount = amount + 1 WHERE order_id = ?';
            db.run(updateQuery, [row.order_id], (err) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send('Database error');
                }
                res.redirect('/cart?userId=' + userId);
            });
        } else {
            const insertQuery = 'INSERT INTO orders (customer_id, product_id, amount, status_id, order_date) VALUES (?, ?, 1, 0, date("now"))';
            db.run(insertQuery, [userId, productId], (err) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send('Database error');
                }
                res.redirect('/cart?userId=' + userId);
            });
        }
    });
});

app.get('/cart/remove/:id', (req, res) => {
    const orderId = req.params.id;
    const userId = req.query.userId;
    
    if (!userId) {
        return res.redirect('/login');
    }
    
    const checkQuery = 'SELECT * FROM orders WHERE order_id = ? AND customer_id = ? AND status_id = 0';
    
    db.get(checkQuery, [orderId, userId], (err, row) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Database error');
        }
        
        if (row && row.amount > 1) {
            const updateQuery = 'UPDATE orders SET amount = amount - 1 WHERE order_id = ?';
            db.run(updateQuery, [orderId], (err) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send('Database error');
                }
                res.redirect('/cart?userId=' + userId);
            });
        } else if (row) {
            const deleteQuery = 'DELETE FROM orders WHERE order_id = ?';
            db.run(deleteQuery, [orderId], (err) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send('Database error');
                }
                res.redirect('/cart?userId=' + userId);
            });
        } else {
            res.redirect('/cart?userId=' + userId);
        }
    });
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
app.post("/manageProduct/addProduct", (req, res) => {

    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, req.body.productName + path.extname(file.originalname));
    }
    });
    const upload = multer({ 
        storage,
        fileFilter,
        limits: { fileSize: 25 * 1024 * 1024 } // 25MB
    }).single('image');

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File size exceeds the limit of 25MB" });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        console.log(req.body);

        const productName = req.body.productName;
        const description = req.body.description;
        const price = req.body.price;
        const amount = req.body.amount;
        const categories = req.body.category;
        let image = req.file ? req.file.filename : "dummy.png";

        let size = "1:1"; // Default
        if (req.body.number_x && req.body.number_y) {
            size = `${req.body.number_x}:${req.body.number_y}`;
        }

        const query = `INSERT INTO products (name, description, price, size, amount, image) 
                    VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(query, [productName, description, price, size, amount, image], function(err) {
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
                            })
                            
                        } else {
                            
                            return res.json({ 
                                success: true, 
                                message: 'Product and categories added successfully',
                                productId: productId
                            })
                        }
                        
                    }
                });
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
            db.get('SELECT image FROM products WHERE id = ?', [id], (err, row) => {
                if (err) {
                console.error("Error fetching product image:", err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to fetch product image' 
                });
                }

                if (row && row.image) {
                const imagePath = path.join(uploadDir, row.image);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                    console.error("Error deleting image file:", err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to delete image file' 
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
                } else {
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
                }
            });
            // db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
            //     if (err) {
            //         console.error("Error deleting product:", err.message);
            //         db.run('ROLLBACK');
            //         return res.status(500).json({ 
            //             success: false, 
            //             message: 'Failed to delete product' 
            //         });
            //     }
                
            //     db.run('COMMIT');
            //     res.json({ 
            //         success: true, 
            //         message: 'Product and related data deleted successfully' 
            //     });
            // });
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