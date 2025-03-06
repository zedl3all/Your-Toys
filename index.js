// index.js

const express = require('express');
const path = require('path');
const multer = require("multer");
const fs = require("fs");
const { constant } = require('async');
const app = express();
const port = 3000;
const promptpayQR = require('promptpay-qr');
const qrcode = require('qrcode');
const open = require('opn');

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

// Calculate price handmade module
const priceCalculator = require('./Utils/priceCalculator');

// static resource & template engine
const uploadDir = path.join(__dirname, "Asset", "Product");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const customizeDir = path.join(__dirname, "Asset", "Customize"); // Add this new line
if (!fs.existsSync(customizeDir)) {
    fs.mkdirSync(customizeDir, { recursive: true });
}

const paymentUploadDir = path.join(__dirname, "Asset", "PaymentProof");
if (!fs.existsSync(paymentUploadDir)) {
    fs.mkdirSync(paymentUploadDir, { recursive: true });
}

app.use('/Asset', express.static(path.join(__dirname, '/Asset')));
app.use(express.static(path.join(__dirname, '/Public')));
app.use('/Views', express.static(path.join(__dirname, '/Views')));
app.use('/Utils', express.static(path.join(__dirname, '/Utils')));

//Filter for upload image
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only JPG, WEBP, PNG, JFIF, and GIF files are allowed"));
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

// File upload oop able to reuse by 112
function createUploadMiddleware(destinationDir, sizeLimit = 25) {
    return function (req, res) {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, destinationDir);
            },
            filename: (req, file, cb) => {
                cb(null, req.params.imgname + path.extname(file.originalname));
            }
        });

        const upload = multer({
            storage,
            fileFilter,
            limits: { fileSize: sizeLimit * 1024 * 1024 }
        });

        return upload.single("image")(req, res, (err) => {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: `File size exceeds the limit of ${sizeLimit}MB` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded or invalid file type" });
            }

            res.json({
                message: "File uploaded successfully",
                filename: req.file.filename,
                path: `/${path.relative(__dirname, destinationDir).replace(/\\/g, '/')}/${req.file.filename}`
            });
        });
    };
}

app.post("/upload-artwork/:imgname", (req, res) => {
    createUploadMiddleware(customizeDir)(req, res);
});

app.post("/upload-payment/:imgname", (req, res) => {
    createUploadMiddleware(paymentUploadDir)(req, res);
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
    const categoriesQuery = 'SELECT * FROM categories';
    const productsQuery = `SELECT * FROM products;`;

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
            const cat = [{ name: "All Product", id: 0 }];
            res.render('ProductAll/ProductAll', { categories, products, cat });
        });
    });
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

app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.query.userId;

    // Base product query
    const query = 'SELECT * FROM products WHERE id = ?';

    // Review query
    const reviewQuery = `SELECT u.username username, r.review_title title, 
                         r.review_description description, r.review_date rdate, r.score score 
                         FROM reviews r JOIN users u ON u.user_id = r.user_id WHERE r.product_id = ?`;

    // Purchase verification query - check if user has completed an order for this product
    const purchaseQuery = `SELECT 1 FROM orders 
                           WHERE customer_id = ? AND product_id = ? AND status_id = 4`;

    // Already reviewed check
    const reviewedQuery = `SELECT 1 FROM reviews 
                          WHERE user_id = ? AND product_id = ? 
                          LIMIT 1`;

    db.get(query, [id], (err, rows) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Database error');
        }

        db.all(reviewQuery, [id], (err, reviewsdata) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Database error');
            }

            // Calculate review statistics
            let allscore = { "five": 0, "four": 0, "three": 0, "two": 0, "one": 0 };
            let total = 0;

            if (reviewsdata.length > 0) {
                for (reviews of reviewsdata) {
                    switch (reviews.score) {
                        case 1:
                            allscore.one += 1;
                            break;
                        case 2:
                            allscore.two += 1;
                            break;
                        case 3:
                            allscore.three += 1;
                            break;
                        case 4:
                            allscore.four += 1
                            break;
                        case 5:
                            allscore.five += 1
                            break;
                    }
                    total += reviews.score
                }

                let average = total / reviewsdata.length;

                for (index in allscore) {
                    allscore[index] = allscore[index] / reviewsdata.length * 100;
                }

                console.log(`Average rating: ${average.toFixed(2)}`);
            } else {
                // No reviews yet
                console.log("No reviews for this product");
            }

            // If user is logged in, check if they purchased this product and haven't reviewed yet
            let canReview = false;
            let reviewStatus = "login_required";

            if (userId) {
                // First check if they already reviewed this product
                db.get(reviewedQuery, [userId, id], (err, reviewed) => {
                    if (err) {
                        console.log(err.message);
                        // Continue with default values
                    } else if (reviewed) {
                        reviewStatus = "already_reviewed";
                    } else {
                        // Check if they purchased this product
                        db.get(purchaseQuery, [userId, id], (err, purchased) => {
                            if (err) {
                                console.log(err.message);
                                // Continue with default values
                            } else if (purchased) {
                                canReview = true;
                                reviewStatus = "can_review";
                            } else {
                                reviewStatus = "no_purchase";
                            }

                            // Render page with all data
                            renderProductPage();
                        });
                        return; // Exit here to wait for the nested query
                    }
                    renderProductPage();
                });
                return; // Exit here to wait for the nested query
            }

            // If not logged in or other cases, render directly
            renderProductPage();

            // Helper function to avoid duplicate code
            function renderProductPage() {
                const average = reviewsdata.length > 0 ? total / reviewsdata.length : 0;

                res.render('Product/product', {
                    data: rows,
                    reviews: reviewsdata,
                    allscore: allscore,
                    average: average,
                    userId: userId,
                    canReview: canReview,
                    reviewStatus: reviewStatus
                });
            }
        });
    });
});

app.post('/getqr', (req, res) => {
    // Get amount from request body or use default
    const amount = parseFloat(req.body.amount) || 0.22;
    const promptpay = '0875513773';
    const format = req.body.format || 'html';

    const payload = promptpayQR(promptpay, { amount: amount });

    console.log(payload);

    qrcode.toString(payload, { type: 'svg' }, (err, qrCodeSvg) => {
        if (err) {
            return res.status(500).send('Error generating QR Code');
        }

        if (format === 'json') {
            // Return just the QR code as JSON for Ajax requests
            return res.json({
                qrCode: qrCodeSvg,
                amount: amount,
                promptpay: promptpay
            });
        }

        // Regular HTML response for direct page loads
        res.render('Test/test', {
            qrCode: qrCodeSvg,
            amount: amount,
            promptpay: promptpay
        });
    });
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
        SELECT o.order_id, o.product_id, p.name, p.price, o.amount as quantity, 
               p.image, o.size, o.detail, o.img
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.customer_id = ? AND o.status_id = 0
    `;

    db.all(query, [userId], (err, items) => {
        if (err) {
            console.log('Database error:', err.message);
            return res.status(500).send('Database error');
        }

        console.log("==== CART PRICE DEBUG ====");
        // Calculate price with ratio factor using the shared function
        let total = 0;
        if (items && items.length > 0) {
            items.forEach(item => {
                console.log(`Processing item: ${item.name} (Order ID: ${item.order_id})`);
                console.log(`- Base price: ${item.price}`);
                console.log(`- Quantity: ${item.quantity}`);
                console.log(`- Size string: "${item.size}"`);

                let x = 1, y = 1;
                if (item.size) {
                    try {
                        [x, y] = item.size.split(':').map(Number);
                        console.log(`- Parsed dimensions: x=${x}, y=${y}`);
                    } catch (e) {
                        console.log(`Error parsing ratio ${item.size}:`, e);
                    }
                }

                // Use the shared calculation function
                const priceData = priceCalculator.calculatePrice(
                    item.price,   // base price
                    x,            // width
                    y,            // height
                    item.quantity // quantity
                );

                console.log(`- Adjusted unit price: ${priceData.unitPrice}`);
                console.log(`- Item total: ${priceData.totalPrice}`);

                item.priceWithRatio = priceData.unitPrice;
                item.itemTotal = priceData.totalPrice;
                total += item.itemTotal;
            });
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
    const quantity = parseInt(req.query.quantity) || 1;
    const specify = req.query.specify || '';
    const ratio = req.query.ratio || '1:1';
    const imgFilename = req.query.img || null;
    // Debug incoming parameters
    console.log('Cart Add Request:');
    console.log('- Product ID:', productId);
    console.log('- User ID:', userId);
    console.log('- Quantity:', quantity);
    console.log('- Specifications:', specify);
    console.log('- Ratio:', ratio);
    console.log('- Artwork Image:', imgFilename);

    if (!userId) {
        return res.redirect('/login');
    }

    // Check if this exact combination already exists
    const checkQuery = 'SELECT * FROM orders WHERE customer_id = ? AND product_id = ? AND size = ? AND detail = ? AND status_id = 0';

    db.get(checkQuery, [userId, productId, ratio, specify], (err, row) => {
        if (err) {
            console.log('Database error when checking existing item:', err.message);
            return res.status(500).send('Database error');
        }

        if (row) {
            console.log(`Found existing item (order_id: ${row.order_id}) with matching product, size and details`);
            const updateQuery = 'UPDATE orders SET amount = amount + ? WHERE order_id = ?';
            db.run(updateQuery, [quantity, row.order_id], (err) => {
                if (err) {
                    console.log('Error updating quantity:', err.message);
                    return res.status(500).send('Database error');
                }
                console.log(`Updated quantity for order ${row.order_id}`);
                res.redirect(`/cart?userId=${userId}`);
            });
        } else {
            console.log('Creating new cart item with these parameters');
            const insertQuery = 'INSERT INTO orders (customer_id, product_id, amount, status_id, order_date, detail, size, img) VALUES (?, ?, ?, 0, date("now"), ?, ?, ?)';
            db.run(insertQuery, [userId, productId, quantity, specify, ratio, imgFilename], function (err) {
                if (err) {
                    console.log('Error inserting new item:', err.message);
                    return res.status(500).send('Database error');
                }
                console.log(`Created new order with ID ${this.lastID}`);
                res.redirect(`/cart?userId=${userId}`);
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

// Process payment in testing
app.post("/upload-payment-proof", (req, res) => {
    // Create multer upload handler
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, paymentUploadDir);
        },
        filename: (req, file, cb) => {
            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 10);
            cb(null, `payment_${timestamp}_${randomString}${path.extname(file.originalname)}`);
        }
    });

    const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB
    }).single('paymentProof');

    // Process the upload
    upload(req, res, function (err) {
        // Log full request body for debugging
        console.log('Received payment upload request with body:', req.body);

        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get userId from form data
        const userId = req.body.userId;
        console.log('User ID from request:', userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing user ID'
            });
        }

        // Update database with payment proof
        const filePath = req.file.filename;
        console.log('File uploaded successfully:', filePath);

        const updateQuery = `
            UPDATE orders 
            SET status_id = 2, 
                bill_img = ?
            WHERE customer_id = ? AND status_id = 0
        `;

        db.run(updateQuery, [filePath, userId], function (err) {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating order status'
                });
            }

            console.log(`Updated ${this.changes} orders for user ${userId}`);

            if (this.changes === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No items in cart to update'
                });
            }

            res.json({
                success: true,
                message: 'Payment proof uploaded successfully',
                file: filePath
            });
        });
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

                // console.log(products);
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

                // console.log(products);
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

            // console.log(product);
            res.send(JSON.stringify(product));
        });
    });
});

// Update Product
app.put('/manageProduct/editproducts/:id', (req, res) => {
    const id = req.params.id;
    console.log("Received update request:", req.body);

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

        // const { productName, description, price, size, amount, categories } = req.body;
        const productName = req.body.productName;
        const description = req.body.description;
        const price = req.body.price;
        const amount = req.body.amount;
        const categories = JSON.parse(req.body.categories);
        const size = req.body.size;
        let image = req.file ? req.file.filename : null;

        // Check if productName has changed
        const oldProductQuery = 'SELECT name, image FROM products WHERE id = ?';
        db.get(oldProductQuery, [id], (err, oldProduct) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (oldProduct && oldProduct.name !== productName) {
                const oldImagePath = path.join(uploadDir, oldProduct.image);
                const newImagePath = path.join(uploadDir, productName + path.extname(oldProduct.image));

                fs.rename(oldImagePath, newImagePath, (err) => {
                    if (err) {
                        console.error("Error renaming image file:", err.message);
                        return res.status(500).json({ error: err.message });
                    }

                    // Update image name in the database
                    const updateImageQuery = 'UPDATE products SET image = ? WHERE id = ?';
                    db.run(updateImageQuery, [productName + path.extname(oldProduct.image), id], (err) => {
                        if (err) {
                            console.error("Database error:", err.message);
                            return res.status(500).json({ error: err.message });
                        }
                    });
                });
            }
        });

        let query = 'UPDATE products SET name = ?, description = ?, price = ?, size = ?, amount = ?';
        let params = [productName, description, price, size, amount];

        if (image) {
            query += ', image = ?';
            params.push(image);
        }

        query += ' WHERE id = ?';
        params.push(id);

        db.run(query, params, function (err) {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (categories && Array.isArray(categories)) {
                db.run('DELETE FROM pro_cat WHERE p_id = ?', [id], function (err) {
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
                        db.run('INSERT INTO pro_cat (p_id, c_id) VALUES (?, ?)', [id, categoryId], function (err) {
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
        const categories = JSON.parse(req.body.categories);
        let image = req.file ? req.file.filename : "dummy.png";

        let size = "1:1"; // Default
        if (req.body.number_x && req.body.number_y) {
            size = `${req.body.number_x}:${req.body.number_y}`;
        }

        const query = `INSERT INTO products (name, description, price, size, amount, image) 
                    VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(query, [productName, description, price, size, amount, image], function (err) {
            if (err) {
                console.error("Error adding product:", err.message);
                return res.status(500).json({ success: false, message: err.message });
            }

            const productId = this.lastID;
            console.log(`Added product successfully with ID: ${productId}`);
            // console.log(categories);
            // console.log(!categories);
            // console.log(!Array.isArray(categories));
            // console.log(categories.length === 0);
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
                db.run('INSERT INTO pro_cat (p_id, c_id) VALUES (?, ?)', [productId, categoryId], function (err) {
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

        db.run('DELETE FROM pro_cat WHERE p_id = ?', [id], function (err) {
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

                        db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
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
                    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
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
    const query = `
    SELECT o.order_id order_id, c.username customer,  o.detail description, order_date, o.img image, s.status_id status, o.bill_img bill_img
    FROM orders o 
    JOIN users c on o.customer_id = c.user_id
    JOIN status s on o.status_id = s.status_id
    where s.status_id > 0;
    `;
    db.all(query, (err, orders) => {
        if (err) {
            console.log('Database error:', err.message);
            return res.status(500).send('Database error');
        }



        res.render('Packing/packing', { orders });
    });

});

app.get('/tracking/:id', (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.render('Tracking/tracking', {
            order: null,
            message: "No order specified"
        });
    }

    const query = `
        SELECT o.order_id, o.customer_id, o.product_id, p.name, p.price, 
               o.amount as quantity, p.image, o.size, o.detail, 
               o.status_id, o.order_date, o.packing_date, o.total_price,
               u.username as customer_name, u.email, u.phone, u.address
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.customer_id = u.user_id
        WHERE o.order_id = ? AND o.status_id BETWEEN 2 AND 4
    `;

    db.all(query, [orderId], (err, items) => {
        if (err) {
            console.log('Database error:', err.message);
            return res.status(500).send('Database error');
        }

        if (!items || items.length === 0) {
            return res.render('Tracking/tracking', {
                order: null,
                message: "Order not found or not in tracking status"
            });
        }

        console.log("Found order with status:", items[0].status_id);

        // Group all items under one order object
        const order = {
            order_id: items[0].order_id,
            customer_name: items[0].customer_name,
            email: items[0].email,
            phone: items[0].phone,
            address: items[0].address,
            status_id: items[0].status_id,
            order_date: items[0].order_date,
            packing_date: items[0].packing_date
        };

        res.render('Tracking/tracking', { order });
    });
});

app.get('/AllOrder/:id', (req, res) => {
    const userId = req.params.id;
    console.log(`AllOrder request for userId: ${userId}`);

    if (!userId) {
        return res.render('AllOrder/allOrder', {
            orders: [],
            message: "Please log in to view your orders",
            statusLabels: {
                2: "Ordered",
                3: "Packed",
                4: "Completed"
            }
        });
    }

    const query = `
        SELECT o.order_id, o.product_id, p.name, p.price, o.amount as quantity, 
               p.image, o.size, o.detail, o.status_id, o.order_date, o.packing_date,
               o.total_price, o.bill_img bill, o.img custom
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.customer_id = ? AND o.status_id BETWEEN 2 AND 4
        ORDER BY o.order_date DESC
    `;

    db.all(query, [userId], (err, items) => {
        if (err) {
            console.log('Database error:', err.message);
            return res.status(500).send('Database error');
        }

        // Group orders by order_id for display
        const groupedOrders = {};
        items.forEach(item => {
            if (!groupedOrders[item.order_id]) {
                groupedOrders[item.order_id] = {
                    order_id: item.order_id,
                    status_id: item.status_id,
                    order_date: item.order_date,
                    packing_date: item.packing_date,
                    bill: item.bill,
                    custom: item.custom,
                    items: [],
                    total: 0
                };
            }

            // Calculate item price if needed
            let itemTotal = item.total_price;
            if (!itemTotal) {
                // Parse ratio and calculate
                let x = 1, y = 1;
                if (item.size) {
                    try {
                        [x, y] = item.size.split(':').map(Number);
                    } catch (e) { console.log(`Error parsing ratio ${item.size}:`, e); }
                }

                // Calculate price
                const priceData = priceCalculator.calculatePrice(
                    item.price, x, y, item.quantity
                );
                itemTotal = priceData.totalPrice;
            }

            // Add item to order
            groupedOrders[item.order_id].items.push({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                detail: item.detail,
                bill: item.bill,
                custom: item.custom,
                total: itemTotal
            });

            // Add to order total
            groupedOrders[item.order_id].total += itemTotal;
        });
        console.log(groupedOrders);
        res.render('AllOrder/allOrder', {
            orders: Object.values(groupedOrders),
            userId: userId,
            message: (items.length === 0) ? "You don't have any orders yet" : null,
            statusLabels: {
                2: "Ordered",
                3: "Packed",
                4: "Completed"
            }
        });
    });
});

app.get('/categories', (req, res) => {
    const query = 'SELECT * FROM categories';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(`Error fetching categories: ${err.message}`);
            res.status(500).json({ success: false, message: 'Failed to fetch categories' });
        } else {
            res.json({ success: true, categories: rows });
        }
    });
});

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

app.post('/updateOrderStatus', (req, res) => {
    const { orderId, status } = req.body;
    console.log(`Updating order ${orderId} to status ${status}`);

    const statusMap = {
        'Waiting for packing': 2,
        'Packing': 3,
        'Success': 4,
        'Failed': 5
    };

    const statusId = statusMap[status];
    console.log(statusId)
    console.log(!statusId)
    if (!statusId) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const query = `UPDATE orders SET status_id = ${statusId} WHERE order_id = ${orderId};`;
    db.run(query, function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    });
});

app.post('/addReview', (req, res) => {
    const { userId, productId, rating, title, content } = req.body;
    console.log(req.body);
    const query = `
        INSERT INTO reviews (user_id, product_id, score, review_title, review_description, review_date)
        VALUES (?, ?, ?, ?, ?, date('now'))
    `;
    db.run(query, [userId, productId, rating, title, content], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Review added successfully' });
    });
});

// 404 Not Found routing
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'Public/404.html'));
});

app.listen(port, async () => {
    console.log(`listening to port ${port}`);
    console.log('<--------------------->');
    console.log(`Server running at: http://localhost:${port}`);
    console.log('<--------------------->');
    await open(`http://localhost:${port}`);
});