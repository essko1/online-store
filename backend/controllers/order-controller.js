// order-controller.js
const { Order, OrderItem, Product, SalesStatistic, Cart, User } = require("../models/model");
const sequelize = require('../db');

const OrderController = {
    createOrder: async (req, res) => {
        const { userId, items, address, useBonusPoints } = req.body;

        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Необходимы userId и список товаров." });
        }

        if (!address) {
            return res.status(400).json({ error: "Адрес обязателен для заполнения." });
        }

        const t = await sequelize.transaction();

        try {
            // Получаем пользователя
            const user = await User.findByPk(userId, { transaction: t });
            if (!user) {
                await t.rollback();
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            // Рассчитываем общую сумму
            let totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
            let bonusPointsUsed = 0;
            let finalAmount = totalAmount;

            // Применяем бонусные баллы (максимум 10% от суммы, как на фронтенде)
            if (useBonusPoints && user.bonusPoints > 0) {
                const maxBonus = Math.floor(totalAmount * 0.1); // 10% от суммы, округляем вниз
                bonusPointsUsed = Math.min(user.bonusPoints, maxBonus);
                finalAmount = totalAmount - bonusPointsUsed;

                // Обновляем бонусные баллы пользователя (гарантируем целое число)
                user.bonusPoints = Math.floor(user.bonusPoints - bonusPointsUsed);
                await user.save({ transaction: t });
            }

            // Создаем заказ
            const newOrder = await Order.create({
                userId,
                address,
                status: "Processing",
                totalAmount,
                usedBonusPoints: bonusPointsUsed,
                finalAmount
            }, { transaction: t });

            // Создаем позиции заказа
            const orderItems = items.map(item => ({
                orderId: newOrder.id,
                productId: item.productId,
                price: item.price,
                quantity: item.quantity,
                weight: item.weight
            }));

            await OrderItem.bulkCreate(orderItems, { transaction: t });

            // Обновляем статистику продаж
            for (const item of items) {
                const salesStatistic = await SalesStatistic.findOne({
                    where: { productId: item.productId },
                    transaction: t
                });

                if (salesStatistic) {
                    await SalesStatistic.update({
                        totalSold: salesStatistic.totalSold + item.quantity,
                        totalRevenue: salesStatistic.totalRevenue + (item.price * item.quantity)
                    }, {
                        where: { productId: item.productId },
                        transaction: t
                    });
                } else {
                    await SalesStatistic.create({
                        productId: item.productId,
                        totalSold: item.quantity,
                        totalRevenue: item.price * item.quantity
                    }, { transaction: t });
                }

                // Уменьшаем количество товара на складе
                const product = await Product.findByPk(item.productId, { transaction: t });
                if (product) {
                    product.quantity -= item.quantity;
                    await product.save({ transaction: t });
                }
            }

            // Очищаем корзину пользователя
            await Cart.destroy({ where: { userId }, transaction: t });

            // Начисляем бонусные баллы (5% от суммы заказа, округляем вниз)
            const bonusPointsEarned = Math.floor(finalAmount * 0.02);
            user.bonusPoints = Math.floor(user.bonusPoints + bonusPointsEarned);
            await user.save({ transaction: t });

            await t.commit();

            res.status(201).json({
                message: "Заказ успешно создан.",
                order: newOrder,
                bonusPointsEarned
            });
        } catch (error) {
            await t.rollback();
            console.error("Ошибка при создании заказа:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getOrdersByUser: async (req, res) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({ error: "userId обязателен." });
            }

            // Ищем заказы пользователя
            const orders = await Order.findAll({
                where: { userId: userId }, // Используем поле userId из модели
                attributes: [
                    "id",
                    "status",
                    "finalAmount",
                    "createdAt",
                    "address"
                ] // Выбираем только нужные поля
            });

            console.log("Found orders:", orders);

            // Если заказы не найдены, возвращаем пустой массив
            if (!orders || orders.length === 0) {
                return res.status(200).json([]);
            }

            // Форматируем данные (если нужно)
            const formattedOrders = orders.map(order => ({
                id: order.id,
                status: order.status,
                finalAmount: order.finalAmount,
                createdAt: order.createdAt,
                address: order.address
            }));

            // Возвращаем данные
            res.status(200).json(formattedOrders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

module.exports = OrderController;