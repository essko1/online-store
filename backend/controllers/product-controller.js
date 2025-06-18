// product-controller.js
const { Product, Shop, Category } = require("../models/model");

const ProductController = {
    createProduct: async (req, res) => {
        const { title, description, price, shopId, categoryId, quantity, weight } = req.body;
        const img = req.file ? req.file.filename : "default-product-image.png";

        if (!title || !shopId || !categoryId || quantity === undefined || weight === undefined) {
            return res.status(400).json({ error: "Название, магазин, категория, количество и вес обязательны" });
        }

        try {
            const product = await Product.create({
                title,
                description,
                price: price || 0,
                img,
                shopId,
                categoryId,
                quantity: quantity || 0,
                weight: weight || 0
            });

            res.status(201).json(product);
        } catch (error) {
            console.error("Error in createProduct:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    updateProduct: async (req, res) => {
        const { id, title, description, price, shopId, categoryId, quantity, weight } = req.body;
        const img = req.file ? req.file.filename : null;

        try {
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ error: "Продукт не найден" });
            }

            const updateData = {
                title: title || product.title,
                description: description || product.description,
                price: price || product.price,
                shopId: shopId || product.shopId,
                categoryId: categoryId || product.categoryId,
                quantity: quantity || product.quantity,
                weight: weight || product.weight
            };

            // Обновляем изображение только если было загружено новое
            if (img) {
                updateData.img = img;
            }

            await product.update(updateData);

            res.status(200).json(product);
        } catch (error) {
            console.error("Error in updateProduct:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getProduct: async (req, res) => {
        try {
            const products = await Product.findAll({
                include: [
                    { model: Shop, attributes: ['name', 'address'] },
                    { model: Category, attributes: ['name'] }
                ],
                attributes: ['id', 'title', 'description', 'price', 'img', 'quantity', 'weight']
            });

            res.json(products);
        } catch (error) {
            console.error("Error in getProducts:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getProductById: async (req, res) => {
        const { id } = req.params;

        try {
            const product = await Product.findByPk(id, {
                include: [
                    { model: Shop, attributes: ['name', 'address'] },
                    { model: Category, attributes: ['name'] }
                ]
            });

            if (!product) {
                return res.status(404).json({ error: "Продукт не найден" });
            }

            res.json(product);
        } catch (error) {
            console.error("Error in getProductById:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;

        try {
            const deletedCount = await Product.destroy({ where: { id } });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Продукт не найден" });
            }

            res.status(200).json({ message: "Продукт успешно удален" });
        } catch (error) {
            console.error("Error in deleteProduct:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },
};

module.exports = ProductController;