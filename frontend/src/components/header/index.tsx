import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../theme-provider";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarMenuItem,
    Tooltip
} from "@nextui-org/react";
import {
    FiMoon,
    FiSun,
    FiShoppingCart,
    FiUser,
    FiLogOut,
    FiHome,
    FiPlus,
    FiHeart,
    FiBook,
    FiBarChart2,
    FiUsers,
    FiTag
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, selectIsAuthenticated, setAuthentication } from "../../features/user/userSlice";

export const Header = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUserId = localStorage.getItem("userId");
        const parsedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;

        if (parsedToken) {
            dispatch(setAuthentication(true));
            setRole(parsedToken.role);
        } else {
            dispatch(setAuthentication(false));
        }

        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/auth");
    };

    const menuItems = [
        { label: "Главная", onClick: () => navigate("/"), icon: <FiHome />, tooltip: "На главную" },
    ];

    if (role === 'admin') {
        menuItems.push(
            { label: "Товары", onClick: () => navigate("/admin/products"), icon: <FiPlus />, tooltip: "Добавить товар" },
            { label: "Магазины", onClick: () => navigate("/admin/shops"), icon: <FiUsers />, tooltip: "Управление магазинами" },
            { label: "Категории", onClick: () => navigate("/admin/categories"), icon: <FiTag />, tooltip: "Управление категориями" },
            { label: "Статистика", onClick: () => navigate("/statistics"), icon: <FiBarChart2 />, tooltip: "Просмотр статистики" },
        );
    } else {
        menuItems.push(
            { label: "Избранное", onClick: () => navigate(`/favorites/${userId}`), icon: <FiHeart />, tooltip: "Избранные товары" },
            { label: "Корзина", onClick: () => navigate(`/cart/${userId}`), icon: <FiShoppingCart />, tooltip: "Корзина покупок" },
            { label: "Заказы", onClick: () => navigate(`/orders`), icon: <FiBook />, tooltip: "Мои заказы" },
            { label: "Профиль", onClick: () => navigate(`/profile/${userId}`), icon: <FiUser />, tooltip: "Мой профиль" },
        );
    }

    return (
        <Navbar isBordered shouldHideOnScroll className="bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <NavbarContent className="sm:hidden" justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
                    className="text-current"
                />
            </NavbarContent>

            <NavbarContent justify="center" className="hidden sm:flex">
                <NavbarBrand>
                    <p className="font-medium text-lg">ONLINE STORE</p>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent justify="end" className="hidden sm:flex gap-1">
                {menuItems.map((item, index) => (
                    <NavbarItem key={index}>
                        <Tooltip content={item.tooltip} placement="bottom" showArrow>
                            <Button
                                isIconOnly
                                variant="light"
                                radius="full"
                                onClick={item.onClick}
                                className="text-lg"
                            >
                                {item.icon}
                            </Button>
                        </Tooltip>
                    </NavbarItem>
                ))}

                <NavbarItem>
                    <Tooltip content="Сменить тему" placement="bottom" showArrow>
                        <Button
                            isIconOnly
                            variant="light"
                            radius="full"
                            onClick={toggleTheme}
                            className="text-lg"
                        >
                            {theme === "light" ? <FiMoon /> : <FiSun />}
                        </Button>
                    </Tooltip>
                </NavbarItem>

                {isAuthenticated && (
                    <NavbarItem>
                        <Tooltip content="Выйти" placement="bottom" showArrow>
                            <Button
                                isIconOnly
                                variant="light"
                                radius="full"
                                onClick={handleLogout}
                                className="text-lg"
                            >
                                <FiLogOut />
                            </Button>
                        </Tooltip>
                    </NavbarItem>
                )}
            </NavbarContent>

            <NavbarMenu className="pt-4">
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={index}>
                        <Button
                            variant="light"
                            className="w-full justify-start gap-3"
                            onClick={() => {
                                item.onClick();
                                setIsMenuOpen(false);
                            }}
                            startContent={item.icon}
                        >
                            {item.label}
                        </Button>
                    </NavbarMenuItem>
                ))}

                <NavbarMenuItem>
                    <Button
                        variant="light"
                        className="w-full justify-start gap-3"
                        onClick={toggleTheme}
                        startContent={theme === "light" ? <FiMoon /> : <FiSun />}
                    >
                        {theme === "light" ? "Темная тема" : "Светлая тема"}
                    </Button>
                </NavbarMenuItem>

                {isAuthenticated && (
                    <NavbarMenuItem>
                        <Button
                            variant="light"
                            className="w-full justify-start gap-3 text-danger"
                            onClick={handleLogout}
                            startContent={<FiLogOut />}
                        >
                            Выйти
                        </Button>
                    </NavbarMenuItem>
                )}
            </NavbarMenu>
        </Navbar>
    );
};