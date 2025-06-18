const { SalesStatistic, Product, Shop, Category } = require("../models/model");
const sequelize = require("../db");

const SalesStatisticController = {
    // Получение общей статистики продаж
    getAllSalesStatistics: async (req, res) => {
        try {
            const statistics = await SalesStatistic.findAll({
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'title', 'price', 'weight'],
                        include: [
                            {
                                model: Category,
                                attributes: ['name']
                            }
                        ]
                    }
                ],
                order: [
                    ['totalRevenue', 'DESC'] // Сортировка по выручке (по убыванию)
                ]
            });

            // Calculate totals
            const totalRevenue = statistics.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0);
            const totalSold = statistics.reduce((sum, stat) => sum + (stat.totalSold || 0), 0);
            const totalWeightSold = statistics.reduce((sum, stat) => {
                return sum + (stat.totalSold * (stat.product?.weight || 0));
            }, 0);

            // Get top selling products
            const topProducts = [...statistics]
                .sort((a, b) => b.totalSold - a.totalSold)
                .slice(0, 5)
                .map(stat => ({
                    id: stat.product?.id,
                    title: stat.product?.title,
                    sold: stat.totalSold,
                    revenue: stat.totalRevenue
                }));

            // Get sales by category
            const salesByCategory = {};
            statistics.forEach(stat => {
                const categoryName = stat.product?.category?.name || 'Uncategorized';
                if (!salesByCategory[categoryName]) {
                    salesByCategory[categoryName] = {
                        sold: 0,
                        revenue: 0
                    };
                }
                salesByCategory[categoryName].sold += stat.totalSold;
                salesByCategory[categoryName].revenue += stat.totalRevenue;
            });

            res.json({
                totalRevenue,
                totalSold,
                statistics: statistics.map(stat => ({
                    id: stat.id,
                    product: {
                        title: stat.product?.title,
                        category: {
                            name: stat.product?.category?.name
                        },
                        price: stat.product?.price
                    },
                    totalRevenue: stat.totalRevenue,
                    totalSold: stat.totalSold
                }))
            });
        } catch (error) {
            console.error("Ошибка при получении статистики продаж:", error);
            res.status(500).json({
                error: "Ошибка сервера",
                details: error.message
            });
        }
    }
};

module.exports = SalesStatisticController;