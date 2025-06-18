const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth-middleware');
const UserController = require('../controllers/user-controller');
const ShopController = require('../controllers/shop-controller');
const CategoryController = require('../controllers/category-controller');
const ProductController = require('../controllers/product-controller');
const CartController = require('../controllers/cart-controller');
const FavoriteController = require('../controllers/favorites-controller');
const OrderController = require('../controllers/order-controller');
const StatisticController = require('../controllers/statistic-controller');
const multer = require("multer");
const path = require("path");

const uploadDestination = 'uploads';

const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Недопустимый тип файла'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// User routes
router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.get("/current", authToken, UserController.current);
router.put("/users/:userId", authToken, UserController.updateUser);
router.get("/users/:userId", authToken, UserController.getUserProfile);

// Product routes
router.get('/products', authToken, ProductController.getProduct);
router.get('/products/:id', authToken, ProductController.getProductById);
router.post('/products', upload.single('img'), authToken, ProductController.createProduct);
router.put('/products', upload.single('img'), authToken, ProductController.updateProduct);
router.delete('/products/:id', authToken, ProductController.deleteProduct);

// Shop routes
router.get('/shops', authToken, ShopController.getShop);
router.post('/shops', authToken, ShopController.createShop);
router.delete('/shops/:id', authToken, ShopController.deleteShop);

// Category routes
router.get('/categories', authToken, CategoryController.getCategories);
router.post('/categories', authToken, CategoryController.createCategory);
router.delete('/categories/:id', authToken, CategoryController.deleteCategory);

// Cart routes
router.post('/cart', authToken, CartController.addToCart);
router.delete('/cart', authToken, CartController.removeFromCart);
router.get('/cart/:userId', authToken, CartController.getCart);

// Favorites routes
router.post('/favorites', authToken, FavoriteController.addToFavorites);
router.delete('/favorites', authToken, FavoriteController.removeFromFavorites);
router.get('/favorites/:userId', authToken, FavoriteController.getFavorites);

// Order routes
router.post('/order', authToken, OrderController.createOrder);
router.get('/order', authToken, OrderController.getOrdersByUser);
// Statistics route
router.get('/statistics', authToken, StatisticController.getAllSalesStatistics);

module.exports = router;