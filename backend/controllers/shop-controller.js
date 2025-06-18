const { Shop } = require("../models/model");

const ShopController = {
    getShop: async (req, res) => {
        try {
            const shops = await Shop.findAll();
            res.json(shops);
        } catch (error) {
            console.error("Ошибка при получении магазинов:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    createShop: async (req, res) => {
        const { name, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Поле имени обязательно" });
        }

        try {
            const shop = await Shop.create({ name, address });
            res.status(201).json(shop);
        } catch (error) {
            console.error("Ошибка при создании магазина:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    deleteShop: async (req, res) => {
        const { id } = req.params;

        try {
            const deletedCount = await Shop.destroy({ where: { id } });

            if (deletedCount === 0) {
                return res.status(404).json({ error: "Магазин не найден" });
            }

            res.status(200).json({ message: "Магазин успешно удален" });
        } catch (error) {
            console.error("Ошибка при удалении магазина:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },
};

module.exports = ShopController;