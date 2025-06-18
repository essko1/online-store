import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "./components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auth } from "./pages/auth";
import { Layout } from "./components/layout";
import RequireAuth from "./app/privateRoutes";
import { ProductsList } from "./pages/productsList";
import {AdminProductsPage} from "./pages/AdminProductsPage";
import {AdminShopsPage} from "./pages/AdminShopsPage"
import {AdminCategoriesPage} from "./pages/AdminCategoriesPage";
import {FavoritesList} from "./pages/favoritesPage";
import {CartList} from "./pages/cartPage";
import StatisticsPage from "./pages/statisticsPage";
import {OrdersPage} from "./pages/ordersPage";
import ProductDetails from "./pages/productDetails";
import {ProfilePage} from "./pages/profilePage";

const container = document.getElementById("root");

const router = createBrowserRouter([
    {
        path: "/auth",
        element: <Auth />,
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: "/",
                element: <Layout />,
                children: [
                    {
                        path: "/store",
                        element: <ProductsList />,
                    },
                    {
                        path: "/admin/products",
                        element: <AdminProductsPage />,
                    },
                    {
                        path: "/admin/shops",
                        element: <AdminShopsPage />,
                    },
                    {
                        path: "/admin/categories",
                        element: <AdminCategoriesPage />,
                    },
                    {
                        path: "/favorites/:userId",
                        element: <FavoritesList />,
                    },
                    {
                        path: "/cart/:userId",
                        element: <CartList />,
                    },
                    {
                        path: "/orders",
                        element: <OrdersPage />,
                    },
                    {
                        path: "/statistics",
                        element: <StatisticsPage />,
                    },
                    {
                        path: "/products/:id",
                        element: <ProductDetails />,
                    },
                    {
                        path: "/profile/:id",
                        element: <ProfilePage />,
                    },
                ],
            },
        ],
    },
]);

if (container) {
    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <Provider store={store}>
                <ThemeProvider>
                    <NextUIProvider>
                        <RouterProvider router={router} />
                    </NextUIProvider>
                </ThemeProvider>
            </Provider>
        </React.StrictMode>
    );
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document."
    );
}