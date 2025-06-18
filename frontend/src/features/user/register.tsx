// components/Register.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@nextui-org/react";
import { Input } from "../../components/input";
import { ErrorMessage } from "../../components/error-message";
import { useRegisterMutation } from "../../app/services/userApi";
import { hasErrorField } from "../../utils/has-error-field";
import { toast } from "react-toastify";

type Register = {
    email: string;
    password: string;
};

type Props = {
    setSelected: (value: string) => void;
};

export const Register: React.FC<Props> = ({ setSelected }) => {
    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<Register>({
        mode: "onChange",
        reValidateMode: "onBlur",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [registerUser, { isLoading }] = useRegisterMutation();
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const onSubmit = async (data: Register) => {
        try {
            const { email, password } = data;
            await registerUser({ email, password }).unwrap();
            setError("");
            toast.success("Регистрация прошла успешно! Теперь вы можете войти.");
            setSelected("login");
        } catch (err) {
            if (hasErrorField(err)) {
                setError(err.data.error || "Ошибка при регистрации");
                toast.error(err.data.error || "Ошибка при регистрации");
                setSuccessMessage("");
            } else {
                setError("Ошибка при регистрации");
                toast.error("Ошибка при регистрации");
                setSuccessMessage("");
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
            {successMessage && <div className="text-green-500">{successMessage}</div>}
            <div className="flex gap-2 justify-end">
                <Button
                    fullWidth
                    color="primary"
                    type="submit"
                    isLoading={isLoading}
                    className="font-medium hover:bg-opacity-90 transition-all"
                >
                    Зарегистрироваться
                </Button>
            </div>
        </form>
    );
};