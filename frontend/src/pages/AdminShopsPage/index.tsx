// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
    Button,
    Input,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip,
    Card,
    CardBody,
    Divider,
    Tooltip
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoIosSearch,
    IoMdClose,
    IoMdAdd,
    IoMdBusiness,
    IoMdTrash,
    IoMdAlert
} from "react-icons/io";
import { FaStore, FaMapMarkedAlt } from "react-icons/fa";
import {
    useCreateShopMutation,
    useDeleteShopMutation,
    useGetShopsQuery,
} from "../../app/services/userApi";

export const AdminShopsPage = () => {
    const [shopName, setShopName] = useState<string>("");
    const [shopAddress, setShopAddress] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const { data: shops, isLoading, error, refetch } = useGetShopsQuery();
    const [addShop] = useCreateShopMutation();
    const [deleteShop] = useDeleteShopMutation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (refetch) refetch();
    }, [refetch]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({message, type});
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const handleAddShop = async () => {
        if (!shopName.trim()) {
            showNotification("Название магазина не может быть пустым.", 'error');
            return;
        }

        const shopExists = shops?.some(
            (shop) => shop.name.toLowerCase() === shopName.toLowerCase()
        );
        if (shopExists) {
            showNotification("Магазин с таким названием уже существует.", 'error');
            return;
        }

        try {
            await addShop({ name: shopName, address: shopAddress }).unwrap();
            showNotification("Магазин успешно добавлен!");
            setShopName("");
            setShopAddress("");
            refetch();
            onClose();
        } catch (error) {
            console.error("Ошибка при добавлении магазина:", error);
            showNotification("Ошибка при добавлении магазина.", 'error');
        }
    };

    const handleDeleteShop = async (id: number) => {
        setIsDeleting(id);
        try {
            await deleteShop(id).unwrap();
            showNotification("Магазин успешно удален!");
            refetch();
        } catch (error) {
            console.error("Ошибка при удалении магазина:", error);
            showNotification("Ошибка при удалении магазина.", 'error');
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredShops = shops?.filter((shop) =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.address && shop.address.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="admin-shops-page p-4 max-w-6xl mx-auto"
        >
            {/* Search and Add Shop Card */}
            <Card className="mb-6 bg-content1 dark:bg-default-100/50">
                <CardBody>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Поиск по названию"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-1/2"
                            startContent={<IoIosSearch className="text-default-400" />}
                            endContent={searchQuery && (
                                <button onClick={() => setSearchQuery("")}>
                                    <IoMdClose className="text-default-400 hover:text-default-600 dark:hover:text-default-200" />
                                </button>
                            )}
                            variant="bordered"
                        />
                        <Button
                            onPress={onOpen}
                            color="primary"
                            startContent={<IoMdAdd className="text-lg" />}
                            className="w-full md:w-auto"
                            variant="shadow"
                        >
                            Добавить магазин
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Add Shop Modal */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                backdrop="blur"
                className="dark:bg-default-100"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="text-lg font-semibold dark:text-white">
                                <IoMdBusiness className="mr-2" />
                                Добавить магазин
                            </ModalHeader>
                            <Divider />
                            <ModalBody className="mt-4">
                                <Input
                                    label="Название магазина"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    placeholder="Введите название магазина"
                                    isRequired
                                    variant="bordered"
                                    startContent={<FaStore className="text-default-400" />}
                                    classNames={{
                                        input: "dark:text-white",
                                        label: "dark:text-gray-300"
                                    }}
                                />
                            </ModalBody>
                            <Divider />
                            <ModalFooter>
                                <Button
                                    onPress={onClose}
                                    variant="light"
                                    className="dark:text-white"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onPress={handleAddShop}
                                    color="primary"
                                    isDisabled={!shopName.trim()}
                                    className="text-white"
                                >
                                    Добавить
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center ${
                            notification.type === 'error'
                                ? 'bg-danger-100 text-danger-700 dark:bg-danger-700 dark:text-danger-100'
                                : 'bg-success-100 text-success-700 dark:bg-success-700 dark:text-success-100'
                        }`}
                    >
                        {notification.type === 'success' ? (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <IoMdAlert className="w-5 h-5 mr-2" />
                        )}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shops List */}
            <Card className="mt-6">
                <CardBody>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner
                                size="lg"
                                label="Загрузка магазинов..."
                                classNames={{
                                    label: "dark:text-white"
                                }}
                            />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-danger-500 dark:text-danger-400">
                            <IoMdAlert className="text-3xl mx-auto mb-3" />
                            <p className="text-lg font-medium">Ошибка при загрузке магазинов</p>
                        </div>
                    ) : filteredShops.length > 0 ? (
                        <Table
                            aria-label="Список магазинов"
                            classNames={{
                                wrapper: "shadow-none",
                                th: [
                                    "bg-gray-200",
                                    "dark:bg-gray-800",
                                    "text-default-500",
                                    "dark:text-white",
                                    "border-divider"
                                ],
                                td: [
                                    "dark:bg-gray-900",
                                    "dark:border-b-gray-800"
                                ],
                                tr: [
                                    "dark:hover:bg-gray-800/50"
                                ]
                            }}
                            removeWrapper
                        >
                            <TableHeader>
                                <TableColumn className="w-2/5">
                                    <div className="flex items-center gap-2">
                                        <FaStore /> Название
                                    </div>
                                </TableColumn>
                                <TableColumn className="text-right">Действия</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredShops.map((shop) => (
                                    <TableRow key={shop.id}>
                                        <TableCell className="font-medium dark:text-white">
                                            {shop.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Tooltip
                                                content="Удалить"
                                                color="danger"
                                                classNames={{
                                                    content: "dark:bg-danger-600 dark:text-white"
                                                }}
                                            >
                                                <Button
                                                    isIconOnly
                                                    onPress={() => handleDeleteShop(Number(shop.id))}
                                                    color="danger"
                                                    variant="light"
                                                    isLoading={isDeleting === shop.id}
                                                    className="text-danger-600 dark:text-danger-400"
                                                >
                                                    <IoMdTrash />
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12 text-center"
                        >
                            <FaStore className="text-4xl text-default-400 mb-4" />
                            <h3 className="text-lg font-medium dark:text-white">
                                {searchQuery ? "Магазины не найдены" : "Нет доступных магазинов"}
                            </h3>
                            <p className="text-default-500 mt-1">
                                {searchQuery
                                    ? "Попробуйте изменить параметры поиска"
                                    : "Добавьте первый магазин"}
                            </p>
                        </motion.div>
                    )}
                </CardBody>
            </Card>
        </motion.div>
    );
};