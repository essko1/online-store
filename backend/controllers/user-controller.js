// user-controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Order } = require("../models/model");

const UserController = {
    register: async (req, res) => {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email и пароль обязательны" });
        }

        try {
            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                return res.status(400).json({ error: "Пользователь уже существует" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                email,
                password: hashedPassword,
                role: role || 'USER',
                bonusPoints: 0
            });

            res.status(201).json({
                email: newUser.email,
                role: newUser.role,
                bonusPoints: newUser.bonusPoints
            });
        } catch (error) {
            console.error("Error in register:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email и пароль обязательны" });
        }

        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(400).json({ error: "Неверный email или пароль" });
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(400).json({ error: "Неверный email или пароль" });
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    role: user.role,
                    email: user.email,
                    bonusPoints: user.bonusPoints
                },
            });
        } catch (error) {
            console.error("Error in login:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    current: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(403).json({ error: "Токен не предоставлен" });
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findByPk(decoded.userId, {
                attributes: ['id', 'email', 'role', 'bonusPoints'],
                include: [{
                    model: Order,
                    attributes: ['id', 'status', 'finalAmount', 'createdAt'],
                    order: [['createdAt', 'DESC']],
                    limit: 5
                }]
            });

            if (!user) {
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            res.json(user);
        } catch (error) {
            console.error("Ошибка при получении текущего пользователя:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    getUserProfile: async (req, res) => {
        const { userId } = req.params;

        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'email', 'phoneNumber', 'address', 'bonusPoints', 'createdAt'],
                include: [{
                    model: Order,
                    attributes: ['id', 'status', 'finalAmount', 'createdAt'],
                    order: [['createdAt', 'DESC']]
                }]
            });

            if (!user) {
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            res.json(user);
        } catch (error) {
            console.error("Ошибка при получении профиля пользователя:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    },

    updateUser: async (req, res) => {
        const { userId } = req.params;
        const { email, phoneNumber, address, password } = req.body;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: "Пользователь не найден" });
            }

            const updateData = {};
            if (email) updateData.email = email;
            if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
            if (address !== undefined) updateData.address = address;
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await user.update(updateData);
            res.json({
                message: "Данные пользователя обновлены",
                user: {
                    id: user.id,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    address: user.address,
                    bonusPoints: user.bonusPoints
                }
            });
        } catch (error) {
            console.error("Ошибка при обновлении пользователя:", error);
            res.status(500).json({ error: "Ошибка сервера" });
        }
    }
};

module.exports = UserController;