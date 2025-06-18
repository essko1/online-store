const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "USER"
    },
    bonusPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: {
                args: /^\+?[\d\s\-\(\)]{10,15}$/,
                msg: "Неверный формат номера телефона"
            }
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    underscored: true
});

const Product = sequelize.define("product", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false }, // Добавлен вес продукта
    img: { type: DataTypes.STRING, allowNull: false },
}, { underscored: true });

const ProductInfo = sequelize.define("product_info", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    description: { type: DataTypes.STRING, allowNull: false },
    composition: { type: DataTypes.STRING }, // Состав продукта
    expirationDate: { type: DataTypes.STRING } // Срок годности
}, { underscored: true });

const Category = sequelize.define("category", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
}, { underscored: true });

const Shop = sequelize.define("shop", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    address: { type: DataTypes.STRING }, // Адрес магазина
}, { underscored: true, timestamps: false });

const Favorite = sequelize.define("favorite", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    }
}, { underscored: true });

const Cart = sequelize.define("cart", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
}, { underscored: true });

const Order = sequelize.define("order", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    usedBonusPoints: { type: DataTypes.INTEGER, defaultValue: 0 }, // Использованные бонусы
    finalAmount: { type: DataTypes.FLOAT, allowNull: false }, // Итоговая сумма после применения бонусов
    address: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "Pending" },
}, { underscored: true });

const SalesStatistic = sequelize.define("sales_statistic", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    },
    totalSold: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalRevenue: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { underscored: true });

const OrderItem = sequelize.define("order_item", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
        type: DataTypes.INTEGER,
        references: {
            model: Order,
            key: 'id'
        },
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false }, // Вес продукта в заказе
}, { underscored: true });

User.hasMany(Favorite);
Favorite.belongsTo(User);

Product.hasMany(Favorite);
Favorite.belongsTo(Product);

User.hasMany(Cart);
Cart.belongsTo(User);

Product.hasMany(Cart);
Cart.belongsTo(Product);

User.hasMany(Order);
Order.belongsTo(User);

Product.hasOne(ProductInfo, { as: 'info', foreignKey: 'productId' });
ProductInfo.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
OrderItem.belongsTo(Order, { as: "order", foreignKey: "orderId" });

Product.hasMany(OrderItem, { as: "orderItems", foreignKey: "productId" });
OrderItem.belongsTo(Product, { as: "product", foreignKey: "productId" });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Category.hasMany(Product);
Product.belongsTo(Category);

Shop.hasMany(Product);
Product.belongsTo(Shop);

Product.hasOne(SalesStatistic);
SalesStatistic.belongsTo(Product);

OrderItem.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', targetKey: 'id' });

module.exports = {
    User,
    Product,
    Category,
    Shop,
    ProductInfo,
    Favorite,
    Cart,
    Order,
    SalesStatistic,
    OrderItem
};