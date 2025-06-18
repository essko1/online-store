import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Input,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react";
import {
    FaEdit,
    FaLock,
    FaEnvelope,
    FaHistory,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaCoins,
    FaCalendarAlt
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "../../app/services/userApi";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../app/utils/dateUtils";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ProfilePage: React.FC = () => {
    const userId = parseInt(localStorage.getItem("userId") || "0", 10);
    const { data: user, isLoading, error, refetch } = useGetUserProfileQuery(userId);
    const [updateUserProfile] = useUpdateUserProfileMutation();
    const navigate = useNavigate();

    // Edit modal state
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editData, setEditData] = useState({
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
        confirmPassword: ""
    });
    const [isEditing, setIsEditing] = useState(false);

    // Initialize edit data when user data loads
    useEffect(() => {
        if (user) {
            setEditData({
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [user]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges     = async () => {
        if (editData.password && editData.password !== editData.confirmPassword) {
            toast.error("Пароли не совпадают");
            return;
        }

        try {
            setIsEditing(true);
            const updatePayload: {
                email?: string;
                phoneNumber?: string;
                address?: string;
                password?: string;
            } = {};

            if (editData.email !== user?.email) updatePayload.email = editData.email;
            if (editData.phoneNumber !== user?.phoneNumber) updatePayload.phoneNumber = editData.phoneNumber;
            if (editData.address !== user?.address) updatePayload.address = editData.address;
            if (editData.password) updatePayload.password = editData.password;

            await updateUserProfile({
                userId,
                ...updatePayload
            }).unwrap();

            toast.success("Профиль успешно обновлен");
            refetch();
            onOpenChange();
        } catch (error) {
            toast.error("Ошибка при обновлении профиля");
            console.error("Update error:", error);
        } finally {
            setIsEditing(false);
        }
    };

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center h-64"
            >
                <Spinner size="lg" color="secondary" />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-danger"
            >
                <FaUser className="text-4xl mb-4" />
                <p className="text-xl">Произошла ошибка при загрузке профиля</p>
                <p className="text-sm">Попробуйте обновить страницу</p>
            </motion.div>
        );
    }

    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center"
            >
                Пользователь не найден
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 max-w-4xl"
        >
            <motion.div whileHover={{ scale: 1.01 }}>
                <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900">
                    <CardHeader className="flex justify-between items-center p-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="bg-indigo-100 dark:bg-indigo-800 p-3 rounded-full"
                            >
                                <FaUser className="text-indigo-600 dark:text-indigo-200 text-2xl" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-100">{user.email}</h2>
                                <p className="text-gray-500 dark:text-gray-300 flex items-center gap-1">
                                    <FaCalendarAlt className="text-gray-400 dark:text-gray-300" />
                                    Зарегистрирован: {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </div>
                        <Button
                            color="secondary"
                            variant="shadow"
                            startContent={<FaEdit />}
                            onPress={onOpen}
                            className="text-white"
                        >
                            Редактировать
                        </Button>
                    </CardHeader>

                    <Divider className="bg-indigo-200 dark:bg-indigo-700" />

                    <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                                >
                                    <FaEnvelope className="text-indigo-500 dark:text-indigo-300" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="font-medium dark:text-gray-200">{user.email}</p>
                                    </div>
                                </motion.div>

                                {user.phoneNumber && (
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                                    >
                                        <FaPhone className="text-green-500 dark:text-green-300" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Телефон</p>
                                            <p className="font-medium dark:text-gray-200">{user.phoneNumber}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                                >
                                    <FaCoins className="text-yellow-500 dark:text-yellow-300" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Бонусные баллы</p>
                                        <p className="font-medium dark:text-gray-200">{user.bonusPoints}</p>
                                    </div>
                                </motion.div>

                                {user.address && (
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                                    >
                                        <FaMapMarkerAlt className="text-red-500 dark:text-red-300" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Адрес</p>
                                            <p className="font-medium dark:text-gray-200">{user.address}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900">
                    <CardHeader className="flex items-center gap-2 p-6">
                        <FaHistory className="text-blue-500 dark:text-blue-300" />
                        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-100">История заказов</h3>
                    </CardHeader>

                    <Divider className="bg-blue-200 dark:bg-blue-700" />

                    <CardBody className="p-0">
                        <Table aria-label="Orders history" removeWrapper>
                            <TableHeader>
                                <TableColumn className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">ЗАКАЗ</TableColumn>
                                <TableColumn className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">ДАТА</TableColumn>
                                <TableColumn className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">СУММА</TableColumn>
                                <TableColumn className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">ДЕЙСТВИЯ</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={user.orders || []}
                                emptyContent={"Нет истории заказов"}
                            >
                                {(order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="dark:text-gray-200">#{order.id}</TableCell>
                                        <TableCell className="dark:text-gray-200">{formatDate(order.createdAt)}</TableCell>

                                        <TableCell className="dark:text-gray-200">{order.finalAmount?.toFixed(2)} руб</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                                onClick={() => navigate(`/orders`)}
                                            >
                                                Подробнее
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Edit Profile Modal */}
            {/* Edit Profile Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
                <ModalContent className="dark:bg-gray-800">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
                                Редактировать профиль
                            </ModalHeader>
                            <ModalBody className="p-6 space-y-4">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={editData.email}
                                    onChange={handleEditChange}
                                    startContent={<FaEnvelope className="text-gray-400" />}
                                    classNames={{
                                        input: "dark:text-white",
                                        label: "dark:text-gray-300"
                                    }}
                                />

                                <Input
                                    label="Телефон"
                                    name="phoneNumber"
                                    value={editData.phoneNumber}
                                    onChange={handleEditChange}
                                    startContent={<FaPhone className="text-gray-400" />}
                                    placeholder="+375 (XX) XXX-XX-XX"
                                    classNames={{
                                        input: "dark:text-white",
                                        label: "dark:text-gray-300"
                                    }}
                                />

                                <Input
                                    label="Адрес"
                                    name="address"
                                    value={editData.address}
                                    onChange={handleEditChange}
                                    startContent={<FaMapMarkerAlt className="text-gray-400" />}
                                    classNames={{
                                        input: "dark:text-white",
                                        label: "dark:text-gray-300"
                                    }}
                                />

                                <Divider className="my-4" />

                                <Input
                                    label="Новый пароль"
                                    name="password"
                                    type="password"
                                    value={editData.password}
                                    onChange={handleEditChange}
                                    startContent={<FaLock className="text-gray-400" />}
                                    description="Оставьте пустым, если не хотите менять пароль"
                                    classNames={{
                                        input: "dark:text-white",
                                        label: "dark:text-gray-300",
                                        description: "dark:text-gray-400"
                                    }}
                                />

                                <Input
                                    label="Подтвердите пароль"
                                    name="confirmPassword"
                                    type="password"
                                    value={editData.confirmPassword}
                                    onChange={handleEditChange}
                                    startContent={<FaLock className="text-gray-400" />}
                                    classNames={{
                                        input: "dark:text-white",
                                        label: "dark:text-gray-300"
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter className="p-4 bg-gray-50 dark:bg-gray-700">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                    className="mr-2"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSaveChanges}
                                    isLoading={isEditing}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                >
                                    Сохранить изменения
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
};