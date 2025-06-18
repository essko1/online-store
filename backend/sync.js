const sequelize = require("./db"); // Подключение к базе данных
const models = require("./models/model"); // Подключение всех моделей

(async () => {
    try {
        // Тестируем соединение
        await sequelize.authenticate();
        console.log("Соединение с базой данных успешно установлено.");

        // Синхронизируем все модели
        await sequelize.sync({ alter: true }); // Создает таблицы или изменяет их структуру
        console.log("Все модели успешно синхронизированы с базой данных.");
    } catch (error) {
        console.error("Ошибка при синхронизации:", error);
    } finally {
        await sequelize.close(); // Закрываем соединение после завершения
    }
})();
