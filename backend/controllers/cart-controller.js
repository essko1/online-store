// cart-controller.js
const { Cart, Product } = require('../models/model');

const CartController = {
    addToCart: async (req, res) => {
        const { productId, userId } = req.body;

        try {
            if (!userId || !productId) {
                return res.status(400).json({ error: "Пожалуйста, предоставьте валидный userId и productId." });
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ error: "Продукт не найден" });
            }

            const cartItem = await Cart.findOne({ where: { userId, productId } });
            if (cartItem) {
                if (cartItem.quantity >= product.quantity) {
                    return res.status(400).json({ error: "Нельзя добавить больше продуктов, чем доступно на складе." });
                }

                cartItem.quantity += 1;
                await cartItem.save();
                console.log(`Количество продукта с ID ${productId} увеличено в корзине`);
            } else {
                if (product.quantity <= 0) {
                    return res.status(400).json({ error: "Продукта нет в наличии." });
                }
                await Cart.create({ userId, productId, quantity: 1 });
                console.log(`Продукт с ID ${productId} добавлен в корзину`);
            }

            res.status(200).json({ message: "Продукт добавлен в корзину" });
        } catch (error) {
            console.error("Ошибка в addToCart:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    removeFromCart: async (req, res) => {
        const { productId, userId } = req.body;

        try {
            const cartItem = await Cart.findOne({ where: { userId, productId } });
            if (!cartItem) {
                return res.status(404).json({ error: "Продукт не найден в корзине" });
            }

            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                await cartItem.save();
                console.log(`Количество продукта с ID ${productId} уменьшено в корзине`);
            } else {
                await cartItem.destroy();
                console.log(`Продукт с ID ${productId} удален из корзины`);
            }

            res.status(200).json({ message: "Продукт удален из корзины" });
        } catch (error) {
            console.error("Ошибка в removeFromCart:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getCart: async (req, res) => {
        const { userId } = req.params;

        try {
            const cartItems = await Cart.findAll({
                where: { userId },
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'title', 'price', 'img', 'weight'],
                    }
                ],
            });

            if (!cartItems || cartItems.length === 0) {
                return res.status(200).json({ message: 'Корзина пуста' });
            }

            res.json(cartItems);
        } catch (error) {
            console.error('Ошибка в getCart:', error);
            res.status(500).json({ error: 'Ошибка при получении корзины.' });
        }
    }
};

module.exports = CartController;