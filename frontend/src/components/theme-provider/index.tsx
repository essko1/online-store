import React, { useState, useEffect } from "react";

type Theme = "dark" | "light"; // Добавляем серую тему

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

export const ThemeContext = React.createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => {},
});
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const defaultTheme: Theme = storedTheme || "light";

    const [theme, setTheme] = useState<Theme>(defaultTheme);

    useEffect(() => {
        // Удаляем предыдущий класс темы и добавляем новый
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
