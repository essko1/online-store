//@ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Input,
    Textarea,
    useDisclosure,
    Divider,
    Spinner,
    Chip,
    Image,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Checkbox,
    Tooltip,
    Badge,
    Avatar
} from "@nextui-org/react";
import {
    FaMinus,
    FaPlus,
    FaShoppingCart,
    FaTrash,
    FaBox,
    FaWeightHanging,
    FaMoneyBillWave,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCheck,
    FaPhone,
    FaCoins,
    FaInfoCircle,
    FaTruck,
    FaClock,
    FaShieldAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useGetCartQuery, useRemoveFromCartMutation, useAddToCartMutation, useCreateOrderMutation } from "../../app/services/userApi";
import { useGetUserProfileQuery } from "../../app/services/userApi";

export const CartList: React.FC = () => {
    const userId = parseInt(localStorage.getItem("userId")!, 10);
    const { data: cartData, isLoading, error, refetch } = useGetCartQuery({ userId: userId.toString() });
    const { data: user } = useGetUserProfileQuery(userId);
    const [removeFromCart] = useRemoveFromCartMutation();
    const [addToCart] = useAddToCartMutation();
    const [createOrder] = useCreateOrderMutation();

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [email, setEmail] = useState(user?.email || "");
    const [address, setAddress] = useState(user?.address || "");
    const [phone, setPhone] = useState(user?.phoneNumber || "");
    const [isProcessing, setIsProcessing] = useState(false);
    const [useBonusPoints, setUseBonusPoints] = useState(false);

    const cartItems = Array.isArray(cartData) ? cartData : [];
    const sortedCartItems = useMemo(() => {
        return [...cartItems].sort((a, b) => a.product.id - b.product.id);
    }, [cartItems]);

    // Calculate totals
    const totalPrice = useMemo(() => {
        return sortedCartItems.reduce(
            (total, item) => total + (item.product?.price || 0) * item.quantity,
            0
        );
    }, [sortedCartItems]);

    const totalWeight = useMemo(() => {
        return sortedCartItems.reduce(
            (total, item) => total + (item.product?.weight || 0) * item.quantity,
            0
        );
    }, [sortedCartItems]);

    const totalItems = useMemo(() => {
        return sortedCartItems.reduce(
            (total, item) => total + item.quantity,
            0
        );
    }, [sortedCartItems]);

    // Bonus points calculations
    const availableBonusPoints = user?.bonusPoints || 0;
    const bonusPointsToUse = useBonusPoints ? Math.min(availableBonusPoints, totalPrice * 0.1) : 0;
    const finalAmount = totalPrice - bonusPointsToUse;

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setAddress(user.address || "");
            setPhone(user.phoneNumber || "");
        }
    }, [user]);

    const handleCartAction = async (action: 'add' | 'remove', productId: number) => {
        if (!userId) return;

        setIsProcessing(true);
        try {
            if (action === 'add') {
                await addToCart({ userId, productId }).unwrap();
            } else {
                await removeFromCart({ userId, productId }).unwrap();
            }
            await refetch();
        } catch (error: any) {
            console.error(`Error ${action === 'add' ? 'adding to' : 'removing from'} cart:`, error);
            toast.error(error?.data?.error || `Произошла ошибка при ${action === 'add' ? 'добавлении' : 'удалении'} товара`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveItem = async (productId: number) => {
        if (!userId) return;

        setIsProcessing(true);
        try {
            await removeFromCart({ userId, productId, removeAll: true }).unwrap();
            toast.success("Товар удалён из корзины");
            await refetch();
        } catch (error: any) {
            console.error("Error removing item from cart:", error);
            toast.error(error?.data?.error || "Произошла ошибка при удалении товара");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!userId || !email || !address) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (sortedCartItems.length === 0) {
            toast.error("Ваша корзина пуста");
            return;
        }

        const items = sortedCartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            weight: item.product.weight
        }));

        setIsProcessing(true);
        try {
            await createOrder({
                userId,
                items,
                address,
                email,
                phone,
                useBonusPoints: useBonusPoints && bonusPointsToUse > 0
            }).unwrap();

            toast.success(
                <div className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span>Заказ успешно создан! Использовано {bonusPointsToUse.toFixed(2)} баллов</span>
                </div>
            );
            onModalClose();
            await refetch();
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast.error(error?.data?.error || "Произошла ошибка при создании заказа");
        } finally {
            setIsProcessing(false);
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
            <div className="flex flex-col items-center justify-center h-64 text-danger dark:text-rose-400">
                <FaShoppingCart className="text-4xl mb-4" />
                <p className="text-xl">Произошла ошибка при загрузке корзины</p>
                <p className="text-sm">Попробуйте обновить страницу</p>
            </div>
        );
    }

    if (sortedCartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <FaShoppingCart className="text-5xl mb-4" />
                <p className="text-xl">Ваша корзина пуста</p>
                <p className="text-sm">Добавьте товары, чтобы продолжить</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <FaShoppingCart className="text-indigo-600 dark:text-indigo-400" />
                            Ваша корзина
                            <Badge color="primary" content={totalItems} shape="circle" size="md">
                                <span className="sr-only">Количество товаров</span>
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                            <FaCoins className="text-yellow-600 dark:text-yellow-300" />
                            <span className="font-medium">{availableBonusPoints.toFixed(2)} баллов</span>
                            <Tooltip content="Вы можете оплатить до 10% суммы заказа баллами">
                                <FaInfoCircle className="text-yellow-600 dark:text-yellow-300 opacity-70" />
                            </Tooltip>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {sortedCartItems.map((item) => (
                                <motion.div
                                    key={item.product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                        <CardBody>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="w-full md:w-1/4">
                                                    <Image
                                                        alt={item.product.title}
                                                        className="object-cover rounded-lg w-full h-auto max-h-40"
                                                        src={`http://localhost:3000/uploads/${item.product.img}`}
                                                        classNames={{
                                                            wrapper: "bg-white p-2 rounded-lg border"
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-semibold">{item.product.title}</h3>
                                                        <div className="text-lg font-bold">
                                                            {(item.product.price * item.quantity).toFixed(2)} руб
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FaMoneyBillWave className="text-indigo-600 dark:text-indigo-400" />
                                                            <span>Цена: <span className="font-medium">{item.product.price} руб/шт</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FaWeightHanging className="text-blue-600 dark:text-blue-400" />
                                                            <span>Вес: <span className="font-medium">{item.product.weight} кг/шт</span></span>
                                                        </div>
                                                        {item.product.category && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <FaBox className="text-purple-600 dark:text-purple-400" />
                                                                <span>Категория: <span className="font-medium">{item.product.category.name}</span></span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FaTruck className="text-green-600 dark:text-green-400" />
                                                            <span>Доставка: <span className="font-medium">1-3 дня</span></span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                                                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1">
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                onPress={() => handleCartAction('remove', item.product.id)}
                                                                isDisabled={isProcessing}
                                                                className="text-red-500"
                                                            >
                                                                <FaMinus size={12} />
                                                            </Button>
                                                            <span className="font-medium">{item.quantity}</span>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                onPress={() => handleCartAction('add', item.product.id)}
                                                                isDisabled={isProcessing}
                                                                className="text-green-500"
                                                            >
                                                                <FaPlus size={12} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FaShieldAlt className="text-green-500" />
                            Гарантии и безопасность
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Avatar isBordered color="success" icon={<FaCheck size={14} />} size="sm" />
                                <div>
                                    <h4 className="font-medium">Безопасная оплата</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Все платежи защищены шифрованием</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Avatar isBordered color="warning" icon={<FaClock size={14} />} size="sm" />
                                <div>
                                    <h4 className="font-medium">Быстрая доставка</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Доставка в течение 1-3 рабочих дней</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <motion.div
                        layout
                        className="sticky top-4 space-y-4"
                    >
                        <Card className="bg-gray-50 dark:bg-gray-800 shadow-sm">
                            <div className="p-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <FaShoppingCart />
                                    Итого
                                </h2>

                                <Divider className="my-3" />

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Товары ({totalItems}):</span>
                                        <span className="font-medium">{totalPrice.toFixed(2)} руб</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Общий вес:</span>
                                        <span className="font-medium">{totalWeight} кг</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Доставка:</span>
                                        <span className="font-medium text-green-600">Бесплатно</span>
                                    </div>
                                </div>

                                <Divider className="my-3" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>К оплате:</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                        {totalPrice.toFixed(2)} руб
                                    </span>
                                </div>

                                <Button
                                    color="primary"
                                    size="lg"
                                    className="w-full mt-4"
                                    onPress={onModalOpen}
                                    isDisabled={isProcessing}
                                >
                                    Оформить заказ
                                </Button>
                            </div>
                        </Card>

                        <Card className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900">
                            <div className="p-4">
                                <h3 className="font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                    <FaCoins />
                                    Бонусная программа
                                </h3>
                                <p className="text-sm mt-2 text-indigo-600 dark:text-indigo-300">
                                    За этот заказ вы получите {(totalPrice * 0.1).toFixed(2)} бонусных баллов (10% от суммы)
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Order Modal */}
            <Modal isOpen={isModalOpen} onClose={onModalClose} size="2xl" backdrop="blur">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b p-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FaCheck className="text-green-500" />
                                    Оформление заказа
                                </h2>
                            </ModalHeader>
                            <ModalBody className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold mb-3 flex items-center gap-2">
                                            <FaShoppingCart />
                                            Товары в заказе ({totalItems})
                                        </h3>
                                        <div className="space-y-3">
                                            {sortedCartItems.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Image
                                                            src={`http://localhost:3000/uploads/${item.product.img}`}
                                                            alt={item.product.title}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-md"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{item.product.title}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {item.quantity} × {item.product.price} руб
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Chip color="default" variant="flat">
                                                            {(item.product.weight * item.quantity)} кг
                                                        </Chip>
                                                        <span className="font-bold">{(item.quantity * item.product.price).toFixed(2)} руб</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    <Divider />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <Input
                                                label="Email"
                                                placeholder="example@mail.com"
                                                value={email}
                                                onValueChange={setEmail}
                                                type="email"
                                                startContent={<FaEnvelope className="text-gray-400" />}
                                                isRequired
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white dark:bg-gray-700"
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                label="Телефон"
                                                placeholder="+375 (XX) XXX-XX-XX"
                                                value={phone}
                                                onValueChange={setPhone}
                                                type="tel"
                                                startContent={<FaPhone className="text-gray-400" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white dark:bg-gray-700"
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Textarea
                                                label="Адрес доставки"
                                                placeholder="Введите полный адрес доставки"
                                                value={address}
                                                onValueChange={setAddress}
                                                startContent={<FaMapMarkerAlt className="text-gray-400 mt-2" />}
                                                isRequired
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white dark:bg-gray-700"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <Divider />

                                    {availableBonusPoints > 0 && (
                                        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-gray-700 border border-yellow-100 dark:border-yellow-900/50">
                                            <Checkbox
                                                isSelected={useBonusPoints}
                                                onValueChange={setUseBonusPoints}
                                                color="warning"
                                                className="mb-3"
                                            >
                                                <span className="font-medium">Использовать бонусные баллы</span>
                                            </Checkbox>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 ml-6 space-y-1">
                                                <p>Доступно баллов: {availableBonusPoints.toFixed(2)}</p>
                                                <p>Можно использовать: {Math.min(availableBonusPoints, totalPrice * 0.1).toFixed(2)} руб (10% от суммы)</p>
                                                <p className="font-medium">После оплаты останется: {(availableBonusPoints - bonusPointsToUse).toFixed(2)} баллов</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 rounded-lg bg-indigo-50 dark:bg-gray-700 border border-indigo-100 dark:border-indigo-900/50">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Сумма заказа:</span>
                                                <span>{totalPrice.toFixed(2)} руб</span>
                                            </div>
                                            {useBonusPoints && (
                                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                                    <span>Оплачено баллами:</span>
                                                    <span>-{bonusPointsToUse.toFixed(2)} руб</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Доставка:</span>
                                                <span className="text-green-600">Бесплатно</span>
                                            </div>
                                            <Divider />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Итого к оплате:</span>
                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                    {finalAmount.toFixed(2)} руб
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t p-4">
                                <Button color="default" variant="light" onPress={onClose}>
                                    Вернуться
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleCreateOrder}
                                    isLoading={isProcessing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    endContent={<FaCheck />}
                                >
                                    Подтвердить заказ
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
};