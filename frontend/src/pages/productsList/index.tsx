//@ts-nocheck
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card,
    CardBody,
    CardFooter,
    Input,
    Pagination,
    Spinner,
    Chip,
    Button,
    Select,
    SelectItem,
    Image,
    Badge,
    Tooltip,
    Skeleton,
} from "@nextui-org/react";
import {
    FaHeart,
    FaShoppingCart,
    FaSearch,
    FaStore,
    FaTimes,
    FaPercentage,
    FaChevronLeft,
    FaChevronRight,
    FaFilter
} from "react-icons/fa";
import { useGetProductsQuery, useAddToFavoritesMutation, useAddToCartMutation, useGetCartQuery } from "../../app/services/userApi";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const promotionalBanners = [
    {
        id: 1,
        title: "Скидки до 30%",
        subtitle: "На все фрукты!",
        image: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: 2,
        title: "Самое свежее",
        subtitle: "Уже в нашем магазине!",
        image: "https://images.unsplash.com/photo-1523473827533-2a64d0d36748?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: 3,
        title: "Бесплатная доставка",
        subtitle: "При заказе от 150 рублей!",
        image: "https://images.unsplash.com/photo-1589010588553-46e8e7c21788?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    }
];

export const ProductsList: React.FC = () => {
    const navigate = useNavigate();
    const userId = parseInt(localStorage.getItem("userId")!, 10);

    // Data fetching
    const { data: products, isLoading, error, refetch } = useGetProductsQuery();
    const { data: cartItems } = useGetCartQuery({ userId: userId?.toString() }, { skip: !userId });
    const [addToFavorites] = useAddToFavoritesMutation();
    const [addToCart] = useAddToCartMutation();

    // State management
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("default");
    const [isBannerLoading, setIsBannerLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    const productsPerPage = 8;

    const nextBanner = () => {
        setCurrentBannerIndex((prev) => prev === promotionalBanners.length - 1 ? 0 : prev + 1);
    };

    const prevBanner = () => {
        setCurrentBannerIndex((prev) => prev === 0 ? promotionalBanners.length - 1 : prev - 1);
    };

    const isProductInFavorites = (productId: number) => false;

    const getCartQuantity = (productId: number) => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        const item = cartItems.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    const handleAddToFavorites = async (productId: number, productTitle: string) => {
        if (!userId) {
            toast.error("Пожалуйста, войдите в систему");
            return;
        }
        try {
            await addToFavorites({ userId, productId }).unwrap();
            toast.success(`"${productTitle}" добавлено в избранное`);
            refetch();
        } catch (error) {
            toast.error("Ошибка при добавлении в избранное");
        }
    };

    const handleAddToCart = async (productId: number, productTitle: string) => {
        if (!userId) {
            toast.error("Пожалуйста, войдите в систему");
            return;
        }
        try {
            await addToCart({ userId, productId }).unwrap();
            toast.success(`"${productTitle}" добавлено в корзину`);
            refetch();
        } catch (error) {
            toast.error("Ошибка при добавлении в корзину");
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSortOption("default");
        setCurrentPage(1);
    };

    const filteredProducts = React.useMemo(() => {
        if (!products) return [];

        let result = [...products];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product =>
                product.title.toLowerCase().includes(query) ||
                (product.category?.name.toLowerCase().includes(query)) ||
                (product.shop?.name.toLowerCase().includes(query)))
        }

        switch (sortOption) {
            case "price-asc": return result.sort((a, b) => a.price - b.price);
            case "price-desc": return result.sort((a, b) => b.price - a.price);
            default: return result;
        }
    }, [products, searchQuery, sortOption]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCardClick = (productId: number) => {
        navigate(`/products/${productId}`);
    };

    if (isLoading) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center h-64">
                <Spinner size="lg" color="secondary" />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-danger">
                <FaStore className="text-4xl mb-4" />
                <p className="text-xl">Произошла ошибка при загрузке товаров</p>
                <p className="text-sm">Попробуйте обновить страницу</p>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}} className="container mx-auto px-4 py-8 max-w-7xl">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Banner Section */}
            <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}} className="mb-8 rounded-xl overflow-hidden shadow-md relative">
                <div className="relative h-64 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentBannerIndex} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}} className="absolute inset-0">
                            <div className="relative h-64 w-full cursor-pointer">
                                <Skeleton isLoaded={!isBannerLoading} className="rounded-lg absolute inset-0 z-0">
                                    <Image
                                        alt={promotionalBanners[currentBannerIndex].title}
                                        className="w-full h-full object-cover"
                                        src={promotionalBanners[currentBannerIndex].image}
                                        removeWrapper
                                        onLoad={() => setIsBannerLoading(false)}
                                    />
                                </Skeleton>
                                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
                                    <div className="ml-12 text-white max-w-md">
                                        <Chip color="danger" variant="solid" startContent={<FaPercentage/>} className="mb-2">
                                            Акция
                                        </Chip>
                                        <h2 className="text-2xl font-bold mb-2">{promotionalBanners[currentBannerIndex].title}</h2>
                                        <p className="text-gray-200">{promotionalBanners[currentBannerIndex].subtitle}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevBanner(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-2 hover:bg-white/50 transition-colors z-20"
                    >
                        <FaChevronLeft className="text-white"/>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextBanner(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-2 hover:bg-white/50 transition-colors z-20"
                    >
                        <FaChevronRight className="text-white"/>
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {promotionalBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); setCurrentBannerIndex(index); }}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentBannerIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Header and Filters Section */}
            <div className="mb-8">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardBody className="p-6">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Каталог товаров</h1>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <Input
                                type="text"
                                placeholder="Поиск товаров..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="flex-1"
                                startContent={<FaSearch className="text-gray-400"/>}
                                variant="bordered"
                                radius="full"
                                classNames={{
                                    inputWrapper: "bg-white dark:bg-gray-800 h-12"
                                }}
                            />

                            <Select
                                label="Сортировка"
                                variant="bordered"
                                selectedKeys={[sortOption]}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="w-48"
                                classNames={{
                                    trigger: "h-12 bg-white dark:bg-gray-800"
                                }}
                            >
                                <SelectItem key="default" value="default">По умолчанию</SelectItem>
                                <SelectItem key="price-asc" value="price-asc">Цена: по возрастанию</SelectItem>
                                <SelectItem key="price-desc" value="price-desc">Цена: по убыванию</SelectItem>
                            </Select>

                            {(searchQuery || sortOption !== "default") && (
                                <Button
                                    size="md"
                                    variant="light"
                                    onClick={clearFilters}
                                    className="text-primary-600 dark:text-primary-400"
                                >
                                    Сбросить
                                </Button>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Active Filters */}
            {(searchQuery || sortOption !== "default") && (
                <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="mb-6 flex flex-wrap gap-2 items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Активные фильтры:</span>

                    {searchQuery && (
                        <Chip
                            color="default"
                            variant="solid"
                            onClose={() => setSearchQuery("")}
                            endContent={<FaTimes className="ml-1"/>}
                        >
                            Поиск: {searchQuery}
                        </Chip>
                    )}

                    {sortOption !== "default" && (
                        <Chip
                            color="default"
                            variant="solid"
                            onClose={() => setSortOption("default")}
                            endContent={<FaTimes className="ml-1"/>}
                        >
                            Сортировка: {sortOption === "price-asc" ? "Цена ↑" : "Цена ↓"}
                        </Chip>
                    )}
                </motion.div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <FaStore className="mx-auto text-5xl text-gray-400 dark:text-gray-500 mb-4"/>
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">Товары не найдены</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Попробуйте изменить параметры поиска</p>
                    <Button color="primary" variant="solid" onClick={clearFilters}>
                        Сбросить фильтры
                    </Button>
                </motion.div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProducts.map((product) => {
                            const cartQuantity = getCartQuantity(Number(product.id));
                            const isFavorite = isProductInFavorites(Number(product.id));

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{opacity: 0, scale: 0.9}}
                                    animate={{opacity: 1, scale: 1}}
                                    whileHover={{scale: 1.03}}
                                    transition={{duration: 0.3}}
                                >
                                    <Card className="h-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                                        <CardBody className="overflow-visible p-0 relative" onClick={() => handleCardClick(Number(product.id))}>
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
                                            {product.discount && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                        </CardBody>
                                        <CardFooter className="flex flex-col items-start p-4 gap-2">
                                            <div className="w-full">
                                                <h4 className="font-bold text-lg line-clamp-2 h-14 dark:text-gray-100">{product.title}</h4>

                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Вес: {product.weight} кг</span>
                                                    {product.quantity > 0 && (
                                                        <span className="text-sm text-green-600 dark:text-green-400">В наличии</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center w-full mt-3">
                                                <div className="flex flex-col">
                                                    {product.discount ? (
                                                        <>
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                {product.price.toLocaleString()} руб
                              </span>
                                                            <span className="font-bold text-xl text-red-600 dark:text-red-400">
                                {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} руб
                              </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                              {product.price.toLocaleString()} руб
                            </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Tooltip content={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}>
                                                        <motion.button
                                                            whileTap={{scale: 0.9}}
                                                            onClick={(e) => { e.stopPropagation(); handleAddToFavorites(Number(product.id), product.title); }}
                                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <FaHeart className={`text-lg ${isFavorite ? 'text-red-500' : 'text-red-500 hover:text-red-500'}`}/>
                                                        </motion.button>
                                                    </Tooltip>
                                                    <Tooltip content={cartQuantity > 0 ? `В корзине: ${cartQuantity}` : "Добавить в корзину"}>
                                                        <motion.button
                                                            whileTap={{scale: 0.9}}
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(Number(product.id), product.title); }}
                                                            disabled={product.quantity === 0}
                                                            className={`p-2 rounded-full relative ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                        >
                                                            <Badge
                                                                content={cartQuantity > 0 ? cartQuantity : null}
                                                                color="primary"
                                                                size="sm"
                                                                shape="circle"
                                                            >
                                                                <FaShoppingCart className={`text-lg ${cartQuantity > 0 ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}/>
                                                            </Badge>
                                                        </motion.button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {filteredProducts.length > productsPerPage && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex justify-center mt-10">
                            <Pagination
                                total={Math.ceil(filteredProducts.length / productsPerPage)}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="lg"
                            />
                        </motion.div>
                    )}
                </>
            )}
        </motion.div>
    );
};