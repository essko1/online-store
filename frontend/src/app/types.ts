// Тип для пользователя
export type User = {
    id: number;
    email: string;
    role: string;
    bonusPoints: number;
    createdAt?: string;
    updatedAt?: string;
};

// Тип для продукта
export type Product = {
    id: number;
    title: string;
    description?: string;
    price: number;
    quantity: number;
    weight: number;
    img: string;
    categoryId: number;
    shopId: number;
    category?: Category;
    shop?: Shop;
    info?: ProductInfo;
    favorites?: Favorite[];
    cartItems?: Cart[];
    orderItems?: OrderItem[];
    salesStatistic?: SalesStatistic;
    createdAt?: string;
    updatedAt?: string;
};

// Тип для информации о продукте
export type ProductInfo = {
    id: number;
    description: string;
    composition?: string;
    expirationDate?: string;
    productId: number;
    product?: Product;
};

// Тип для категории
export type Category = {
    id: number;
    name: string;
    products?: Product[];
    createdAt?: string;
    updatedAt?: string;
};

// Тип для магазина
export type Shop = {
    id: number;
    name: string;
    address?: string;
    products?: Product[];
    createdAt?: string;
    updatedAt?: string;
};

// Тип для избранного
export type Favorite = {
    id: number;
    userId: number;
    productId: number;
    user?: User;
    product?: Product;
    createdAt?: string;
    updatedAt?: string;
};

// Тип для корзины
export type Cart = {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    user?: User;
    product?: Product;
    createdAt?: string;
    updatedAt?: string;
};

// Тип для заказа
export type Order = {
    id: number;
    userId: number;
    totalAmount: number;
    usedBonusPoints: number;
    finalAmount: number;
    address: string;
    status: string;
    user?: User;
    items?: OrderItem[];
    createdAt?: string;
    updatedAt?: string;
};

// Тип для позиции заказа
export type OrderItem = {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    weight: number;
    order?: Order;
    product?: Product;
    createdAt?: string;
    updatedAt?: string;
};

// Тип для статистики продаж
export type SalesStatistic = {
    id: number;
    productId: number;
    totalSold: number;
    totalRevenue: number;
    product?: Product;
    createdAt?: string;
    updatedAt?: string;
};