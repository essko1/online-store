import React, { useContext } from "react";
import { ThemeContext } from "../theme-provider";
import { Button, Link, Divider, Tooltip } from "@nextui-org/react";
import {
    FiGithub,
    FiTwitter,
    FiInstagram,
    FiMail,
    FiCreditCard,
    FiPhone,
    FiMapPin,
    FiClock,
    FiMoon,
    FiSun
} from "react-icons/fi";

export const AppFooter = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`w-full border-t ${theme === "dark" ? "bg-black/90 border-gray-800" : "bg-white/90 border-gray-200"} backdrop-blur-sm`}>
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand info */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl">ONLINE STORE</span>
                        </div>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Лучший онлайн магазин с широким ассортиментом товаров по доступным ценам.
                        </p>
                        <div className="flex gap-4">
                            <Tooltip content="Twitter" placement="bottom">
                                <Button isIconOnly variant="light" radius="full" as={Link} href="#">
                                    <FiTwitter className="text-lg" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Instagram" placement="bottom">
                                <Button isIconOnly variant="light" radius="full" as={Link} href="#">
                                    <FiInstagram className="text-lg" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="GitHub" placement="bottom">
                                <Button isIconOnly variant="light" radius="full" as={Link} href="#">
                                    <FiGithub className="text-lg" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Контакты */}
                    <div>
                        <h3 className={`font-semibold text-lg mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
                            Контакты
                        </h3>
                        <div className={`flex flex-col gap-3 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <div className="flex items-center gap-2">
                                <FiMail size={16} />
                                support@onlinestore.com
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone size={16} />
                                <div className="flex flex-col">
                                    <span>+375 (29) 123-45-67 (МТС)</span>
                                    <span>+375 (33) 987-65-43 (A1)</span>
                                    <span>+375 (25) 555-44-33 (LIFE)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMapPin size={16} />
                                <span>г. Минск, ул. Примерная, 123</span>
                            </div>
                        </div>
                    </div>

                    {/* График работы */}
                    <div>
                        <h3 className={`font-semibold text-lg mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
                            Информация
                        </h3>
                        <div className={`flex flex-col gap-3 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            <div className="flex items-center gap-2">
                                <FiClock size={16} />
                                <span>Пн-Пт: 9:00 - 20:00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiClock size={16} />
                                <span>Сб-Вс: 10:00 - 18:00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCreditCard size={16} />
                                <span>Безопасные платежи</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider className={`my-6 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`} />

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4 md:mb-0`}>
                        © {currentYear} Online Store. Все права защищены.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="light"
                            size="sm"
                            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                            onClick={toggleTheme}
                            startContent={theme === "light" ? <FiMoon size={14} /> : <FiSun size={14} />}
                        >
                            {theme === "light" ? "Темная тема" : "Светлая тема"}
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
};