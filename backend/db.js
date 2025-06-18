const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("store", "postgres", "1", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});

module.exports = sequelize;
