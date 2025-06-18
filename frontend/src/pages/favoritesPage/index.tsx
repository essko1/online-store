//@ts-nocheck
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Spinner,
    Image,
    Badge,
    Tooltip
} from "@nextui-org/react";
import {
    FaHeart,
    FaShoppingCart,
    FaTrash,
    FaRegSadTear
} from "react-icons/fa";
import {
    useGetFavoritesQuery,
    useRemoveFromFavoritesMutation,
    useAddToCartMutation
} from "../../app/services/userApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const FavoritesList: React.FC = () => {
    const userId = parseInt(localStorage.getItem("userId")!, 10);
    const { data: favoritesResponse, isLoading, error, refetch } = useGetFavoritesQuery({ userId: userId.toString() });
    const [removeFromFavorites] = useRemoveFromFavoritesMutation();
    const [addToCart] = useAddToCartMutation();

    const favorites = Array.isArray(favoritesResponse) ? favoritesResponse.map(item => item.product) : [];

    useEffect(() => {
        if (refetch) refetch();
    }, [refetch]);

    const handleRemoveFromFavorites = async (productId: number, productTitle: string) => {
        try {
            await removeFromFavorites({ userId, productId }).unwrap();
            toast.success(`"${productTitle}" удален из избранного`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                icon: <FaTrash className="text-red-500" />,
            });
            refetch();
        } catch (error) {
            toast.error("Ошибка при удалении из избранного", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    const handleAddToCart = async (productId: number, productTitle: string) => {
        try {
            await addToCart({ userId, productId }).unwrap();
            toast.success(`"${productTitle}" добавлен в корзину`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                icon: <FaShoppingCart className="text-blue-500" />,
            });
        } catch (error) {
            toast.error("Ошибка при добавлении в корзину", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="secondary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-danger">
                <FaHeart className="text-4xl mb-4" />
                <p className="text-xl">Произошла ошибка при загрузке избранного</p>
                <p className="text-sm">Попробуйте обновить страницу</p>
            </div>
        );
    }

    if (!favorites || favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <FaRegSadTear className="text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium">В избранном пока нет товаров</h3>
                <Button
                    color="primary"
                    variant="flat"
                    className="mt-4"
                    onClick={() => window.location.href = '/store'}
                >
                    Перейти к товарам
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Toast Container */}
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
                theme="light"
            />

            {/* Header */}
            <div className="mb-8">
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <FaHeart className="text-red-500 text-2xl" />
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Избранные товары
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {favorites.length} товар{favorites.length > 1 ? 'а' : ''} в избранном
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((product) => (
                    <Card
                        key={product.id}
                        className="h-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        isPressable
                        onPress={() => window.location.href = `/products/${product.id}`}
                    >
                        <CardBody className="overflow-visible p-0 relative">
                            {product.quantity === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-t-lg z-10">
                                    <span className="text-white font-medium px-4 py-2 bg-red-500 rounded-full">
                                        Нет в наличии
                                    </span>
                                </div>
                            )}
                            <Image
                                alt={product.title}
                                className="object-cover rounded-t-lg w-full h-48"
                                src={`http://localhost:3000/uploads/${product.img}`}
                                removeWrapper
                            />
                            {product.isNew && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    NEW
                                </div>
                            )}
                        </CardBody>
                        <CardFooter className="flex flex-col items-start p-4 gap-2">
                            <div className="w-full">
                                <h4 className="font-bold text-lg line-clamp-2 h-14 dark:text-gray-100">
                                    {product.title}
                                </h4>

                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Вес: {product.weight} г
                                    </span>
                                    {product.quantity > 0 && (
                                        <span className="text-sm text-green-600 dark:text-green-400">
                                            В наличии
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center w-full mt-2">
                                <span className="font-bold text-lg">
                                    {product.price.toLocaleString()} ₽
                                </span>
                                <div className="flex gap-2">
                                    <Tooltip content="Добавить в корзину">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product.id, product.title);
                                            }}
                                            disabled={product.quantity === 0}
                                        >
                                            <FaShoppingCart className="text-lg" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Удалить из избранного">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFromFavorites(product.id, product.title);
                                            }}
                                        >
                                            <FaTrash className="text-lg" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};