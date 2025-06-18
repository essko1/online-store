// @ts-nocheck
import React, { useState } from "react";
import {
    FaRegEdit,
    FaSearch,
    FaBoxOpen,
    FaPlus,
    FaImage,
    FaMoneyBillWave,
    FaWeightHanging,
    FaLayerGroup
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { Product, Category, Shop } from "../../app/types";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    useGetProductsQuery,
    useDeleteProductMutation,
    useCreateProductMutation,
    useUpdateProductMutation,
    useGetCategoriesQuery,
    useGetShopsQuery,
    useGetProductByIdQuery
} from "../../app/services/userApi";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Spinner,
    Input,
    Tooltip,
    Pagination,
    Card,
    Tabs,
    Tab,
    Divider,
    Select,
    SelectItem,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    CardBody
} from "@nextui-org/react";
import { ErrorMessage } from "../../components/error-message";
import { motion } from "framer-motion";

export const AdminProductsPage = () => {
    const { data: products, isLoading, error, refetch } = useGetProductsQuery();
    const { data: categories = [] } = useGetCategoriesQuery();
    const { data: shops = [] } = useGetShopsQuery();
    const [deleteProduct] = useDeleteProductMutation();
    const [addProduct] = useCreateProductMutation();
    const [updateProduct] = useUpdateProductMutation();

    const [searchTerm, setSearchTerm] = useState("");
    const [newProductData, setNewProductData] = useState<Omit<Product, 'id'>>({
        title: "",
        description: "",
        price: 0,
        quantity: 0,
        weight: 0,
        categoryId: categories[0]?.id || 0,
        shopId: shops[0]?.id || 0,
        img: null
    });
    const [editProductData, setEditProductData] = useState<Product | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Обработчики удаления
    const handleDelete = async (productId: number) => {
        try {
            await deleteProduct(productId);
            toast.success("Товар успешно удален");
            refetch();
        } catch (error) {
            toast.error("Ошибка при удалении товара");
        }
    };

    // Обработчики открытия модальных окон
    const openCreateModal = () => {
        setNewProductData({
            title: "",
            description: "",
            price: 0,
            quantity: 0,
            weight: 0,
            categoryId: categories[0]?.id || 0,
            shopId: shops[0]?.id || 0,
            img: null
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditProductData({
            ...product,
            img: product.img
        });
        setIsEditModalOpen(true);
    };

    // Обработчики отправки форм
    const handleCreate = async () => {
        if (!validateProductData(newProductData)) return;

        const formData = createFormData(newProductData);

        try {
            await addProduct(formData).unwrap();
            toast.success("Товар успешно добавлен!");
            closeModals();
            refetch();
        } catch (error) {
            handleError(error, 'добавлении');
        }
    };

    const handleUpdate = async () => {
        if (!editProductData?.id) return;
        if (!validateProductData(editProductData)) return;

        const formData = createFormData(editProductData);
        formData.append("id", editProductData.id.toString());

        try {
            await updateProduct(formData).unwrap();
            toast.success("Товар успешно обновлен!");
            closeModals();
            refetch();
        } catch (error) {
            handleError(error, 'обновлении');
        }
    };

    // Вспомогательные функции
    const validateProductData = (data: Omit<Product, 'id'>) => {
        const validations = [
            { condition: !data.title.trim(), message: "Введите название товара" },
            { condition: !data.price || Number(data.price) <= 0, message: "Введите корректную цену" },
            { condition: !data.quantity || Number(data.quantity) < 0, message: "Введите корректное количество" },
            { condition: !data.weight || Number(data.weight) <= 0, message: "Введите корректный вес" },
            { condition: !data.categoryId, message: "Выберите категорию" },
            { condition: !data.shopId, message: "Выберите магазин" },
            { condition: !isEditModalOpen && !data.img, message: "Загрузите изображение товара" }
        ];

        for (const { condition, message } of validations) {
            if (condition) {
                toast.error(message);
                return false;
            }
        }
        return true;
    };

    const createFormData = (data: Omit<Product, 'id'>) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description || "");
        formData.append("price", data.price.toString());
        formData.append("categoryId", data.categoryId.toString());
        formData.append("shopId", data.shopId.toString());
        formData.append("quantity", data.quantity.toString());
        formData.append("weight", data.weight.toString());

        if (data.img && data.img instanceof Blob) {
            formData.append("img", data.img, data.img.name);
        }

        return formData;
    };

    const handleError = (error: any, action: string) => {
        console.error(`Ошибка при ${action} товара:`, error);
        toast.error(`Ошибка при ${action} товара: ${error.data?.message || error.status}`);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setNewProductData({
            title: "",
            description: "",
            price: 0,
            quantity: 0,
            weight: 0,
            categoryId: categories[0]?.id || 0,
            shopId: shops[0]?.id || 0,
            img: null
        });
        setEditProductData(null);
    };

    // Фильтрация и пагинация
    const filteredProducts = products?.filter(product =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Spinner size="lg" label="Загрузка товаров..." />
        </div>
    );

    if (error) return <ErrorMessage error="Ошибка при загрузке товаров" />;

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaBoxOpen /> Управление товарами
            </h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    placeholder="Поиск по названию товара"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2"
                    startContent={<FaSearch className="text-gray-400" />}
                />
                <Button
                    color="primary"
                    startContent={<FaPlus />}
                    onPress={openCreateModal}
                >
                    Добавить товар
                </Button>
            </div>

            {/* Таблица товаров */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900">
                <CardBody className="p-0">
                    <Table aria-label="Products table" removeWrapper>
                        <TableHeader>
                            <TableColumn>ТОВАР</TableColumn>
                            <TableColumn>КАТЕГОРИЯ</TableColumn>
                            <TableColumn>МАГАЗИН</TableColumn>
                            <TableColumn>ЦЕНА</TableColumn>
                            <TableColumn>НА СКЛАДЕ</TableColumn>
                            <TableColumn>ДЕЙСТВИЯ</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {paginatedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {product.img && (
                                                <img
                                                    src={`http://localhost:3000/uploads/${product.img}`}
                                                    alt={product.title}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{product.title}</p>
                                                <p className="text-sm text-gray-500">{product.weight} кг</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {product.category?.name || 'Без категории'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{product.shop?.name}</TableCell>
                                    <TableCell>{product.price} ₽</TableCell>
                                    <TableCell>{product.quantity} шт.</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Tooltip content="Редактировать">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => openEditModal(product)}
                                                >
                                                    <FaRegEdit className="text-blue-500" />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="Удалить">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => handleDelete(product.id)}
                                                >
                                                    <MdDeleteForever className="text-danger" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Пагинация */}
            <div className="flex justify-center mt-4">
                <Pagination
                    total={Math.ceil(filteredProducts.length / itemsPerPage)}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    color="primary"
                />
            </div>

            {/* Модальное окно создания товара */}
            <Modal isOpen={isCreateModalOpen} onClose={closeModals} size="2xl">
                <ModalContent>
                    <ModalHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
                        Добавить новый товар
                    </ModalHeader>
                    <ModalBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input
                                label="Название товара"
                                value={newProductData.title}
                                onChange={(e) => setNewProductData({...newProductData, title: e.target.value})}
                                required
                                startContent={<FaBoxOpen className="text-gray-400" />}
                            />

                            <Select
                                label="Категория"
                                selectedKeys={[newProductData.categoryId.toString()]}
                                onChange={(e) => setNewProductData({...newProductData, categoryId: Number(e.target.value)})}
                                startContent={<FaLayerGroup className="text-gray-400" />}
                            >
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Магазин"
                                selectedKeys={[newProductData.shopId.toString()]}
                                onChange={(e) => setNewProductData({...newProductData, shopId: Number(e.target.value)})}
                                startContent={<FaBoxOpen className="text-gray-400" />}
                            >
                                {shops.map((shop) => (
                                    <SelectItem key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="file"
                                label="Изображение товара"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setNewProductData({...newProductData, img: e.target.files[0]});
                                    }
                                }}
                                accept="image/*"
                                startContent={<FaImage className="text-gray-400" />}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <Input
                                label="Цена (₽)"
                                type="number"
                                value={newProductData.price.toString()}
                                onChange={(e) => setNewProductData({...newProductData, price: Number(e.target.value)})}
                                required
                                startContent={<FaMoneyBillWave className="text-gray-400" />}
                            />
                            <Input
                                label="Количество"
                                type="number"
                                value={newProductData.quantity.toString()}
                                onChange={(e) => setNewProductData({...newProductData, quantity: Number(e.target.value)})}
                                required
                            />
                            <Input
                                label="Вес (кг)"
                                type="number"
                                step="0.1"
                                value={newProductData.weight.toString()}
                                onChange={(e) => setNewProductData({...newProductData, weight: Number(e.target.value)})}
                                required
                                startContent={<FaWeightHanging className="text-gray-400" />}
                            />
                        </div>

                        <Input
                            label="Описание"
                            value={newProductData.description}
                            onChange={(e) => setNewProductData({...newProductData, description: e.target.value})}
                            multiline
                            minRows={2}
                        />

                        {newProductData.img && (
                            <div className="mt-4">
                                <img
                                    src={URL.createObjectURL(newProductData.img)}
                                    alt="Preview"
                                    className="max-h-40 mx-auto"
                                />
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter className="bg-gray-50 dark:bg-gray-700 p-4">
                        <Button color="danger" variant="light" onPress={closeModals}>
                            Отмена
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleCreate}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        >
                            Добавить товар
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Модальное окно редактирования товара */}
            <Modal isOpen={isEditModalOpen} onClose={closeModals} size="2xl">
                <ModalContent>
                    <ModalHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
                        Редактировать товар
                    </ModalHeader>
                    <ModalBody className="p-6">
                        {editProductData && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Input
                                        label="Название товара"
                                        value={editProductData.title || ''}
                                        onChange={(e) => setEditProductData({...editProductData, title: e.target.value})}
                                        required
                                        startContent={<FaBoxOpen className="text-gray-400" />}
                                    />

                                    <Select
                                        label="Категория"
                                        selectedKeys={editProductData.categoryId ? [editProductData.categoryId.toString()] : []}
                                        onChange={(e) => setEditProductData({...editProductData, categoryId: Number(e.target.value)})}
                                        startContent={<FaLayerGroup className="text-gray-400" />}
                                    >
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Магазин"
                                        selectedKeys={editProductData.shopId ? [editProductData.shopId.toString()] : []}
                                        onChange={(e) => setEditProductData({...editProductData, shopId: Number(e.target.value)})}
                                        startContent={<FaBoxOpen className="text-gray-400" />}
                                    >
                                        {shops.map((shop) => (
                                            <SelectItem key={shop.id} value={shop.id}>
                                                {shop.name}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Input
                                        type="file"
                                        label="Изображение товара"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setEditProductData({...editProductData, img: e.target.files[0]});
                                            }
                                        }}
                                        accept="image/*"
                                        startContent={<FaImage className="text-gray-400" />}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <Input
                                        label="Цена (₽)"
                                        type="number"
                                        value={editProductData.price?.toString() || '0'}
                                        onChange={(e) => setEditProductData({...editProductData, price: Number(e.target.value)})}
                                        required
                                        startContent={<FaMoneyBillWave className="text-gray-400" />}
                                    />
                                    <Input
                                        label="Количество"
                                        type="number"
                                        value={editProductData.quantity?.toString() || '0'}
                                        onChange={(e) => setEditProductData({...editProductData, quantity: Number(e.target.value)})}
                                        required
                                    />
                                    <Input
                                        label="Вес (кг)"
                                        type="number"
                                        step="0.1"
                                        value={editProductData.weight?.toString() || '0'}
                                        onChange={(e) => setEditProductData({...editProductData, weight: Number(e.target.value)})}
                                        required
                                        startContent={<FaWeightHanging className="text-gray-400" />}
                                    />
                                </div>

                                <Input
                                    label="Описание"
                                    value={editProductData.description || ''}
                                    onChange={(e) => setEditProductData({...editProductData, description: e.target.value})}
                                    multiline
                                    minRows={2}
                                />

                                {editProductData.img && (
                                    <div className="mt-4">
                                        <img
                                            src={editProductData.img instanceof Blob ?
                                                URL.createObjectURL(editProductData.img) :
                                                `http://localhost:3000/uploads/${editProductData.img}`}
                                            alt="Preview"
                                            className="max-h-40 mx-auto"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter className="bg-gray-50 dark:bg-gray-700 p-4">
                        <Button color="danger" variant="light" onPress={closeModals}>
                            Отмена
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleUpdate}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        >
                            Сохранить изменения
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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
        </div>
    );
};