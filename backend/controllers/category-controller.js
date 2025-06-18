// category-controller.js
const { Category, Product } = require("../models/model");

const CategoryController = {
    getCategories: async (req, res) => {
        try {
            const categories = await Category.findAll({
                include: [{
                    model: Product,
                    attributes: ['id', 'title', 'price', 'img'],
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                }]
            });
            res.json(categories);
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getCategoryById: async (req, res) => {
        const { id } = req.params;

        try {
            const category = await Category.findByPk(id, {
                include: [{
                    model: Product,
                    attributes: ['id', 'title', 'price', 'img', 'weight', 'quantity'],
                    order: [['title', 'ASC']]
                }]
            });

            if (!category) {
                return res.status(404).json({ error: "Категория не найдена" });
            }

            res.json(category);
        } catch (error) {
            console.error("Ошибка при получении категории:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    createCategory: async (req, res) => {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Название категории обязательно" });
        }

        try {
            const category = await Category.create({ name });
            res.status(201).json(category);
        } catch (error) {
            console.error("Ошибка при создании категории:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    updateCategory: async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Название категории обязательно" });
        }

        try {
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ error: "Категория не найдена" });
            }

            await category.update({ name });
            res.json(category);
        } catch (error) {
            console.error("Ошибка при обновлении категории:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    deleteCategory: async (req, res) => {
        const { id } = req.params;

        try {
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ error: "Категория не найдена" });
            }

            await Product.update(
                { categoryId: null },
                { where: { categoryId: id } }
            );

            await category.destroy();

            res.json({ message: "Категория успешно удалена, продукты отвязаны" });
        } catch (error) {
            console.error("Ошибка при удалении категории:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getCategoryStats: async (req, res) => {
        try {
            const stats = await Category.findAll({
                attributes: ['id', 'name'],
                include: [{
                    model: Product,
                    attributes: [],
                    required: true,
                    include: [{
                        model: SalesStatistic,
                        attributes: []
                    }]
                }],
                group: ['Category.id'],
                raw: true,
                nest: true,
                attributes: [
                    'id',
                    'name',
                    [sequelize.fn('COUNT', sequelize.col('products.id')), 'productsCount'],
                    [sequelize.fn('SUM', sequelize.col('products.sales_statistic.totalRevenue')), 'totalRevenue'],
                    [sequelize.fn('SUM', sequelize.col('products.sales_statistic.totalSold')), 'totalSold']
                ]
            });

            res.json(stats);
        } catch (error) {
            console.error("Ошибка при получении статистики категорий:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    }
};

module.exports = CategoryController;