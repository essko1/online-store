import { User, Product, Shop, Category } from "../types";
import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // User endpoints
    login: builder.mutation<{ token: string; user: { id: number; email: string; role: string; bonusPoints: number } }, { email: string; password: string }>({
      query: (userData) => ({
        url: "/login",
        method: "POST",
        body: userData,
      }),
    }),

    register: builder.mutation<{ email: string; role: string; bonusPoints: number }, { email: string; password: string; role?: string }>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),

    current: builder.query<User, void>({
      query: () => ({
        url: "/current",
        method: "GET",
      }),
    }),

    // Product endpoints
    getProducts: builder.query<Product[], void>({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
    }),

    getProductById: builder.query<Product, string>({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (productData) => ({
        url: "/products",
        method: "POST",
        body: productData,
      }),
    }),

    updateProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: '/products', // Измените endpoint
        method: 'PUT', // Используйте POST для FormData
        body: formData,
      }),
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
    }),

    // Shop endpoints
    getShops: builder.query<Shop[], void>({
      query: () => ({
        url: "/shops",
        method: "GET",
      }),
    }),

    createShop: builder.mutation<Shop, { name: string; address?: string }>({
      query: (shopData) => ({
        url: "/shops",
        method: "POST",
        body: shopData,
      }),
    }),

    deleteShop: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/shops/${id}`,
        method: "DELETE",
      }),
    }),

    // Category endpoints
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
    }),

    createCategory: builder.mutation<Category, { name: string }>({
      query: (categoryData) => ({
        url: "/categories",
        method: "POST",
        body: categoryData,
      }),
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
    }),

    // Cart endpoints
    addToCart: builder.mutation<void, { userId: number; productId: number }>({
      query: ({ userId, productId }) => ({
        url: `/cart`,
        method: "POST",
        body: { userId, productId },
      }),
    }),

    removeFromCart: builder.mutation<void, { userId: number; productId: number }>({
      query: ({ userId, productId }) => ({
        url: `/cart`,
        method: "DELETE",
        body: { productId, userId },
      }),
    }),

    getCart: builder.query<{ product: Product; quantity: number }[], { userId: string }>({
      query: ({ userId }) => ({
        url: `/cart/${userId}`,
        method: "GET",
      }),
    }),

    // Favorites endpoints
    addToFavorites: builder.mutation<void, { userId: number; productId: number }>({
      query: ({ userId, productId }) => ({
        url: `/favorites`,
        method: "POST",
        body: { productId, userId },
      }),
    }),

    removeFromFavorites: builder.mutation<void, { userId: number; productId: number }>({
      query: ({ userId, productId }) => ({
        url: `/favorites`,
        method: "DELETE",
        body: { productId, userId },
      }),
    }),

    getFavorites: builder.query<Product[], { userId: string }>({
      query: ({ userId }) => ({
        url: `/favorites/${userId}`,
        method: "GET",
      }),
    }),

    // Order endpoints
    createOrder: builder.mutation<{ message: string; order: any; bonusPointsEarned: number }, {
      userId: number;
      items: Array<{
        productId: number;
        quantity: number;
        price: number;
        weight: number
      }>;
      address: string;
      useBonusPoints?: boolean
    }>({
      query: (orderData) => ({
        url: "/order",
        method: "POST",
        body: orderData,
      }),
    }),

    getOrdersByUser: builder.query<Array<{
      id: number;
      status: string;
      finalAmount: number;
      createdAt: string;
      items: Array<{
        product: { title: string; price: number; weight: number };
        quantity: number;
        price: number;
      }>;
    }>, { userId: number }>({
      query: ({ userId }) => ({
        url: `/order`,
        method: "GET",
        params: { userId },
      }),
    }),

    getUserProfile: builder.query<{
      id: number;
      email: string;
      phoneNumber?: string;
      address?: string;
      bonusPoints: number;
      createdAt: string;
      orders: Array<{
        id: number;
        status: string;
        finalAmount: number;
        createdAt: string;
      }>;
    }, number>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
    }),

// Update the updateUserProfile endpoint
    updateUserProfile: builder.mutation<{
      email?: string;
      phoneNumber?: string;
      address?: string;
      password?: string;
    }, {
      userId: number;
      email?: string;
      phoneNumber?: string;
      address?: string;
      password?: string;
    }>({
      query: ({ userId, ...updateData }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: updateData,
      }),
    }),

    // Statistics endpoint
    getStatistics: builder.query<{ totalRevenue: number; totalSold: number }, void>({
      query: () => ({
        url: "/statistics",
        method: "GET",
      }),
    }),
  }),

});

export const {
  useLoginMutation,
  useRegisterMutation,
  useCurrentQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetShopsQuery,
  useCreateShopMutation,
  useDeleteShopMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useLazyCurrentQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useGetCartQuery,
  useCreateOrderMutation,
  useGetOrdersByUserQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetFavoritesQuery,
  useGetStatisticsQuery,
  useUpdateUserProfileMutation,
  useGetUserProfileQuery
} = userApi;

export const {
  endpoints: {
    login,
    register,
    current,
    getProducts,
    deleteProduct,
    getShops,
    createShop,
    deleteShop,
    deleteCategory,
    createProduct,
    getProductById
  },
} = userApi;