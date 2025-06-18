//@ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Button,
    Spinner,
    Divider,
    Chip,
    Badge,
    Tooltip,
    Image
} from "@nextui-org/react";
import {
    useGetProductByIdQuery,
    useAddToCartMutation,
    useAddToFavoritesMutation,
    useRemoveFromFavoritesMutation,
    useGetCartQuery,
    useGetFavoritesQuery
} from "../../app/services/userApi";
import {
    FaHeart,
    FaShoppingCart,
    FaStore,
    FaBoxOpen,
    FaInfoCircle,
    FaTags,
    FaIdCard,
    FaChevronRight,
    FaCheck,
    FaPlus,
    FaMinus
} from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { GiWeight } from "react-icons/gi";
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';

const ProductDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: product, isLoading, error } = useGetProductByIdQuery(Number(id));
    const [addToCart] = useAddToCartMutation();
    const [addToFavorites] = useAddToFavoritesMutation();
    const [removeFromFavorites] = useRemoveFromFavoritesMutation();

    const userId = Number(localStorage.getItem("userId"));

    // Получаем данные корзины и избранного
    const { data: cartResponse, isLoading: isCartLoading } = useGetCartQuery({ userId: userId.toString() }, { skip: !userId });
    const { data: favoritesResponse, isLoading: isFavoritesLoading } = useGetFavoritesQuery({ userId: userId.toString() }, { skip: !userId });

    const [isInCart, setIsInCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(0);

    // Проверяем состояние товара
    useEffect(() => {
        if (!isCartLoading && cartResponse && product) {
            const cartItems = Array.isArray(cartResponse) ? cartResponse : [];
            const cartItem = cartItems.find(item => item.product.id === product.id);
            setIsInCart(!!cartItem);
            setCartQuantity(cartItem?.quantity || 0);
        }

        if (!isFavoritesLoading && favoritesResponse && product) {
            const favorites = Array.isArray(favoritesResponse) ? favoritesResponse.map(item => item.product) : [];
            setIsFavorite(favorites.some(fav => fav.id === product.id));
        }
    }, [cartResponse, favoritesResponse, product, isCartLoading, isFavoritesLoading]);

    const handleAddToCart = async () => {
        try {
            if (!userId) {
                toast.error("Войдите в систему для добавления в корзину");
                navigate('/auth');
                return;
            }

            await addToCart({ userId, productId: Number(id) }).unwrap();

            toast.success(
                <div>
                    <p>Товар добавлен в корзину!</p>
                    <p className="text-sm">Текущее количество: {cartQuantity + 1}</p>
                </div>,
                {
                    icon: <FaShoppingCart className="text-blue-500" />,
                }
            );

            // Обновляем локальное состояние
            setIsInCart(true);
            setCartQuantity(prev => prev + 1);
        } catch (error) {
            toast.error("Ошибка при добавлении в корзину");
            console.error("Add to cart error:", error);
        }
    };

    const handleRemoveFromCart = async () => {
        try {
            if (!userId || !isInCart) return;

            // Здесь должна быть логика уменьшения количества товара в корзине
            // В демо просто уменьшаем счетчик
            if (cartQuantity > 1) {
                setCartQuantity(prev => prev - 1);
                toast.info(`Количество уменьшено до ${cartQuantity - 1}`);
            } else {
                setIsInCart(false);
                setCartQuantity(0);
                toast.info("Товар удалён из корзины");
            }
        } catch (error) {
            toast.error("Ошибка при изменении количества");
            console.error("Remove from cart error:", error);
        }
    };

    const handleFavoriteClick = async () => {
        try {
            if (!userId) {
                toast.error("Войдите в систему для управления избранным");
                navigate('/auth');
                return;
            }

            if (isFavorite) {
                await removeFromFavorites({ userId, productId: Number(id) }).unwrap();
                toast.info("Товар удалён из избранного", {
                    icon: <FaHeart className="text-red-500" />,
                });
                setIsFavorite(false);
            } else {
                await addToFavorites({ userId, productId: Number(id) }).unwrap();
                toast.success("Товар добавлен в избранное", {
                    icon: <FaHeart className="text-red-500" />,
                });
                setIsFavorite(true);
            }
        } catch (error) {
            toast.error("Ошибка при изменении избранного");
            console.error("Favorite error:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner
                    size="lg"
                    label="Загрузка товара..."
                    classNames={{
                        base: "dark:text-white",
                        label: "dark:text-gray-300"
                    }}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500 dark:text-red-400">
                <p className="text-xl">Ошибка при загрузке товара</p>
                <Button
                    className="mt-4"
                    onClick={() => window.location.reload()}
                    color="danger"
                    variant="flat"
                >
                    Попробовать снова
                </Button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12 dark:text-gray-200">
                <p className="text-xl">Товар не найден</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate('/')}
                    color="primary"
                    variant="flat"
                >
                    Вернуться в магазин
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="flex justify-center">
                    <Badge
                        content={product.quantity > 0 ? "В наличии" : "Нет в наличии"}
                        color={product.quantity > 0 ? "success" : "danger"}
                        placement="top-left"
                        size="lg"
                    >
                        <Image
                            alt={product.title}
                            className="object-cover rounded-xl w-[500px] h-[500px]" // Фиксированные размеры
                            style={{
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                            src={`http://localhost:3000/uploads/${product.img}`}
                            removeWrapper
                        />
                    </Badge>
                </div>

                {/* Product Info */}
                <motion.div
                    className="space-y-6"
                    initial={{x: 20, opacity: 0}}
                    animate={{x: 0, opacity: 1}}
                    transition={{delay: 0.2}}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Chip
                                color="primary"
                                variant="flat"
                                startContent={<FaTags className="mr-1"/>}
                                classNames={{
                                    base: "dark:border-primary/50",
                                    content: "font-medium"
                                }}
                            >
                                {product.category?.name || 'Без категории'}
                            </Chip>
                            {product.shop?.name && (
                                <Chip
                                    variant="flat"
                                    startContent={<FaStore className="mr-1 text-gray-500 dark:text-gray-300"/>}
                                    classNames={{
                                        base: "dark:border-gray-600",
                                        content: "text-gray-600 dark:text-gray-300"
                                    }}
                                >
                                    {product.shop.name}
                                </Chip>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold dark:text-white">{product.title}</h1>

                        <div className="flex items-center mt-3 gap-2">
                            <Tooltip content="Количество на складе">
                                <div className="flex items-center bg-default-100 dark:bg-default-200 px-2 py-1 rounded-full">
                                    <FaBoxOpen className="text-blue-500 mr-1"/>
                                    <span className={`text-sm ${product.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {product.quantity} шт.
                                    </span>
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    <Divider className="dark:bg-gray-700"/>

                    <div>
                        <h2 className="text-2xl font-semibold text-primary dark:text-primary-300">
                            {product.price.toLocaleString('ru-RU')} руб
                        </h2>
                        {product.oldPrice && (
                            <p className="text-gray-400 line-through text-sm">
                                {product.oldPrice.toLocaleString('ru-RU')} руб
                            </p>
                        )}
                    </div>

                    <Divider className="dark:bg-gray-700"/>

                    <div>
                        <h3 className="text-lg font-medium mb-2 dark:text-white flex items-center gap-2">
                            <IoMdInformationCircleOutline className="text-blue-500"/>
                            Описание
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-default-100 dark:bg-default-200 p-3 rounded-lg">
                            <h3 className="text-md font-medium mb-2 dark:text-white flex items-center gap-2">
                                <GiWeight className="text-purple-500"/>
                                Вес
                            </h3>
                            <p className="dark:text-gray-300">{product.weight} кг</p>
                        </div>
                        <div className="bg-default-100 dark:bg-default-200 p-3 rounded-lg">
                            <h3 className="text-md font-medium mb-2 dark:text-white flex items-center gap-2">
                                <FaIdCard className="text-green-500"/>
                                ID товара
                            </h3>
                            <p className="dark:text-gray-300">{product.id}</p>
                        </div>
                    </div>

                    <Divider className="dark:bg-gray-700"/>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {isInCart ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    isIconOnly
                                    color="danger"
                                    variant="flat"
                                    onPress={handleRemoveFromCart}
                                    className="h-12"
                                >
                                    <FaMinus/>
                                </Button>
                                <div className="flex-1 flex items-center p-4 justify-center bg-default-100 dark:bg-default-200 h-12 rounded-full">
                                    <span className="font-semibold text-sm">{cartQuantity} в корзине</span>
                                </div>
                                <Button
                                    isIconOnly
                                    color="success"
                                    variant="flat"
                                    onPress={handleAddToCart}
                                    className="h-12"
                                    isDisabled={product.quantity <= cartQuantity}
                                >
                                    <FaPlus/>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                color="primary"
                                className="flex-1 h-12"
                                startContent={<FaShoppingCart/>}
                                onPress={handleAddToCart}
                                isDisabled={product.quantity <= 0}
                                radius="full"
                            >
                                В корзину
                            </Button>
                        )}
                        <Button
                            variant={isFavorite ? "solid" : "flat"}
                            color={isFavorite ? "danger" : "default"}
                            className={`flex-1 h-12 ${isFavorite ? '' : 'dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                            startContent={<FaHeart/>}
                            onPress={handleFavoriteClick}
                            radius="full"
                        >
                            {isFavorite ? "В избранном" : "В избранное"}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Additional Info Section */}
            <motion.div
                className="mt-12"
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.4}}
            >
                <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500"/>
                    Характеристики
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        className="bg-default-100 dark:bg-default-200 p-6 rounded-xl"
                        whileHover={{y: -5}}
                    >
                        <h3 className="font-medium mb-4 text-lg dark:text-white flex items-center gap-2">
                            <FaChevronRight className="text-primary"/>
                            Основные характеристики
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-default-200 dark:border-default-100">
                                <span className="text-gray-500 dark:text-gray-400">Категория</span>
                                <span className="font-medium dark:text-white">{product.category?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-default-200 dark:border-default-100">
                                <span className="text-gray-500 dark:text-gray-400">Вес</span>
                                <span className="font-medium dark:text-white">{product.weight} кг</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-default-200 dark:border-default-100">
                                <span className="text-gray-500 dark:text-gray-400">Поставщик</span>
                                <span className="font-medium dark:text-white">{product.shop?.name || '—'}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-default-100 dark:bg-default-200 p-6 rounded-xl"
                        whileHover={{ y: -5 }}
                    >
                        <h3 className="font-medium mb-4 text-lg dark:text-white flex items-center gap-2">
                            <FaChevronRight className="text-primary" />
                            Дополнительная информация
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-default-200 dark:border-default-100">
                                <span className="text-gray-500 dark:text-gray-400">ID товара</span>
                                <span className="font-medium dark:text-white">{product.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-default-200 dark:border-default-100">
                                <span className="text-gray-500 dark:text-gray-400">Наличие</span>
                                <Chip
                                    color={product.quantity > 0 ? "success" : "danger"}
                                    variant="flat"
                                    size="sm"
                                >
                                    {product.quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                                </Chip>
                            </div>
                            <div className="flex justify-between py-2 border-b border-default-200 dark:border-default-100">
                                <span className="text-gray-500 dark:text-gray-400">Дата добавления</span>
                                <span className="font-medium dark:text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductDetails;