// components/Login.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@nextui-org/react";
import { Input } from "../../components/input";
import { ErrorMessage } from "../../components/error-message";
import { useLoginMutation, useLazyCurrentQuery } from "../../app/services/userApi";
import { hasErrorField } from "../../utils/has-error-field";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

type Login = {
    email: string;
    password: string;
};

type Props = {
    setSelected: (value: string) => void;
};

export const Login: React.FC<Props> = ({ setSelected }) => {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Login>({
        mode: "onChange",
        reValidateMode: "onBlur",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    type DecodedToken = {
        exp: number;
        iat: number;
        role: string;
        userId: number;
    };

    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");
    const [triggerCurrentQuery] = useLazyCurrentQuery();

    const from = "/store";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const fetchCurrentUser = async () => {
                try {
                    await triggerCurrentQuery();
                } catch (err) {
                    console.error("Ошибка при загрузке текущего пользователя", err);
                }
            };
            fetchCurrentUser();
        }
    }, [triggerCurrentQuery]);

    const onSubmit = async (data: Login) => {
        try {
            const result = await login(data).unwrap();
            localStorage.setItem("token", result.token);

            const decodedToken: { userId: number; role: string; exp: number; iat: number } = jwtDecode(result.token);

            if (decodedToken.userId) {
                localStorage.setItem("userId", decodedToken.userId.toString());
                toast.success("Вход выполнен успешно!");
                navigate("/store", { replace: true });
            } else {
                throw new Error("User ID not found in token");
            }
        } catch (err) {
            console.error("Login error:", err);
            if (hasErrorField(err)) {
                setError(err.data.error);
                toast.error(err.data.error || "Ошибка при входе");
            } else {
                setError("Ошибка при входе");
                toast.error("Ошибка при входе");
            }
        }
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
                control={control}
                name="email"
                label="Email"
                type="email"
                required="Обязательное поле"
            />
            <Input
                control={control}
                name="password"
                label="Пароль"
                type="password"
                required="Обязательное поле"
            />
            <ErrorMessage error={error} />
            <div className="flex gap-2 justify-end">
                <Button
                    fullWidth
                    color="primary"
                    type="submit"
                    isLoading={isLoading}
                    className="font-medium hover:bg-opacity-90 transition-all"
                >
                    Войти
                </Button>
            </div>
        </form>
    );
};