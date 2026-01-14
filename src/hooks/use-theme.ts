import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme") as Theme;
            if (savedTheme) {
                return savedTheme;
            }
        }
        // Default to dark as per current site design
        return "dark";
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === "dark" ? "light" : "dark";
            localStorage.setItem("theme", newTheme);
            return newTheme;
        });
    };

    return { theme, setTheme, toggleTheme };
}
