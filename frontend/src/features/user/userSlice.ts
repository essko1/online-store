import { createSlice } from "@reduxjs/toolkit";
import { userApi } from "../../app/services/userApi";
import { RootState } from "../../app/store";
import { User } from "../../app/types";

// Определяем типы для состояния
interface InitialState {
    user: User | null;
    isAuthenticated: boolean;
    users: User[] | null;
    current: User | null;
    token?: string;
    error?: string | null;
    loading: boolean; // Новое состояние для загрузки
}

const initialState: InitialState = {
    user: null,
    isAuthenticated: localStorage.getItem("token") ? true : false, // Проверка на наличие токена в localStorage
    users: null,
    current: null,
    token: localStorage.getItem("token") || undefined, // Восстановление токена из localStorage
    error: null,
    loading: false, // Начальное состояние загрузки
};

const slice = createSlice({
    name: "user",
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            //@ts-ignore
            state.token = null;
            localStorage.removeItem("token"); // Удаляем токен из localStorage при выходе
        },
        resetUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setError: (state, action) => {
            state.error = action.payload; // Установка ошибки
        },
        clearError: (state) => {
            state.error = null; // Сброс ошибки
        },
        setAuthentication: (state, action) => {
            state.isAuthenticated = action.payload; // Устанавливаем isAuthenticated
        },
    },
    extraReducers: (builder) => {
        builder
            // Когда логин успешно выполнен
            .addMatcher(userApi.endpoints.login.matchFulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                localStorage.setItem("token", action.payload.token); // Сохраняем токен в localStorage
            })
            // Когда запрос на логин в процессе
            .addMatcher(userApi.endpoints.login.matchPending, (state) => {
                state.loading = true; // Начало загрузки
            })
            // Когда запрос на логин завершён (успешно или с ошибкой)
            .addMatcher(userApi.endpoints.login.matchFulfilled, (state) => {
                state.loading = false; // Конец загрузки
            })
            .addMatcher(userApi.endpoints.login.matchRejected, (state) => {
                state.loading = false; // Конец загрузки
            });
    },
});

export const { setAuthentication, logout, resetUser, setError, clearError } = slice.actions;
export default slice.reducer;

// Селекторы для получения данных из состояния
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrent = (state: RootState) => state.auth.current;
export const selectUsers = (state: RootState) => state.auth.users;
export const selectUser = (state: RootState) => state.auth.user;
export const selectError = (state: RootState) => state.auth.error; // Селектор для получения ошибки
export const selectLoading = (state: RootState) => state.auth.loading; // Селектор для получения состояния загрузки
