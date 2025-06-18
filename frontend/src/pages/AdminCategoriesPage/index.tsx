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
    Tooltip,
    Chip,
    Card,
    CardBody,
    Divider
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoIosSearch,
    IoMdClose,
    IoMdAddCircleOutline,
    IoMdTrash
} from "react-icons/io";
import {
    FaLayerGroup,
    FaRegSadTear,
    FaSearch
} from "react-icons/fa";
import {
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useGetCategoriesQuery,
} from "../../app/services/userApi";
import { ErrorMessage } from "../../components/error-message";

export const AdminCategoriesPage = () => {
    const [categoryName, setCategoryName] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery();
    const [addCategory] = useCreateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
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

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            showNotification("Название категории не может быть пустым", 'error');
            return;
        }

        const categoryExists = categories?.some(
            (category) => category.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (categoryExists) {
            showNotification("Категория с таким названием уже существует", 'error');
            return;
        }

        try {
            await addCategory({ name: categoryName }).unwrap();
            showNotification("Категория успешно добавлена");
            setCategoryName("");
            refetch();
            onClose();
        } catch (error) {
            console.error("Ошибка при добавлении категории:", error);
            showNotification("Ошибка при добавлении категории", 'error');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        setIsDeleting(id);
        try {
            await deleteCategory(id).unwrap();
            showNotification("Категория успешно удалена");
            refetch();
        } catch (error) {
            console.error("Ошибка при удалении категории:", error);
            showNotification("Ошибка при удалении категории", 'error');
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredCategories = categories?.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="admin-categories-page p-4 max-w-6xl mx-auto"
        >
            <Card className="p-4 mb-6 bg-content1 dark:bg-default-100/50">
                <CardBody>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Поиск по названию категории"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-1/2"
                            startContent={<FaSearch className="text-default-400" />}
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
                            startContent={<IoMdAddCircleOutline className="text-lg" />}
                            className="w-full md:w-auto"
                            variant="shadow"
                        >
                            Добавить категорию
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Add Category Modal */}
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
                                <FaLayerGroup className="mr-2" />
                                Добавить категорию
                            </ModalHeader>
                            <Divider />
                            <ModalBody className="mt-4">
                                <Input
                                    label="Название категории"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Введите название категории"
                                    isRequired
                                    variant="bordered"
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
                                    onPress={handleAddCategory}
                                    color="primary"
                                    isDisabled={!categoryName.trim()}
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
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Categories List */}
            <Card className="mt-6">
                <CardBody>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner
                                size="lg"
                                label="Загрузка категорий..."
                                classNames={{
                                    label: "dark:text-white"
                                }}
                            />
                        </div>
                    ) : error ? (
                        <ErrorMessage error="Ошибка при загрузке категорий" />
                    ) : filteredCategories.length > 0 ? (
                        <Table
                            aria-label="Список категорий"
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
                                <TableColumn className="w-4/5">НАЗВАНИЕ</TableColumn>
                                <TableColumn className="text-right">ДЕЙСТВИЯ</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 dark:text-white">
                                                <FaLayerGroup className="text-default-500" />
                                                {category.name}
                                            </div>
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
                                                    onPress={() => handleDeleteCategory(Number(category.id))}
                                                    color="danger"
                                                    variant="light"
                                                    isLoading={isDeleting === category.id}
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
                            <FaRegSadTear className="text-4xl text-default-400 mb-4" />
                            <h3 className="text-lg font-medium dark:text-white">
                                {searchQuery ? "Категории не найдены" : "Нет доступных категорий"}
                            </h3>
                            <p className="text-default-500 mt-1">
                                {searchQuery
                                    ? "Попробуйте изменить параметры поиска"
                                    : "Добавьте первую категорию"}
                            </p>
                        </motion.div>
                    )}
                </CardBody>
            </Card>

            {filteredCategories.length > 10 && (
                <div className="mt-4 text-sm text-default-500 dark:text-default-400 text-center">
                    Показано {filteredCategories.length} категорий
                </div>
            )}
        </motion.div>
    );
};