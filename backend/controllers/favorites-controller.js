// favorites-controller.js
const { Favorite, Product } = require('../models/model');

const FavoriteController = {
    addToFavorites: async (req, res) => {
        const { productId, userId } = req.body;
        try {
            if (!userId || !productId) {
                return res.status(400).json({ error: "Пожалуйста, предоставьте валидный userId и productId." });
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ error: "Продукт не найден" });
            }

            const favoriteItem = await Favorite.findOne({ where: { userId, productId } });
            if (favoriteItem) {
                return res.status(400).json({ error: "Продукт уже добавлен в избранное" });
            }

            await Favorite.create({ userId, productId });
            res.status(200).json({ message: "Продукт добавлен в избранное" });
        } catch (error) {
            console.error("Error in addToFavorites:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    removeFromFavorites: async (req, res) => {
        const { productId, userId } = req.body;
        try {
            const favoriteItem = await Favorite.findOne({ where: { userId, productId } });
            if (!favoriteItem) {
                return res.status(404).json({ error: "Продукт не найден в избранном" });
            }

            await favoriteItem.destroy();
            res.status(200).json({ message: "Продукт удален из избранного" });
        } catch (error) {
            console.error("Error in removeFromFavorites:", error);
            res.status(500).json({ error: "Произошла ошибка на сервере." });
        }
    },

    getFavorites: async (req, res) => {
        const { userId } = req.params;
        try {
            const favorites = await Favorite.findAll({
                where: { userId },
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'title', 'price', 'img', 'weight', "quantity"],
                    }
                ],
            });

            if (!favorites || favorites.length === 0) {
                return res.status(200).json({ message: 'Избранное пустое' });
            }

            res.json(favorites);
        } catch (error) {
            console.error('Error in getFavorites:', error);
            res.status(500).json({ error: 'Произошла ошибка при получении избранного.' });
        }
    }
};

module.exports = FavoriteController;