import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // check local storage for saved theme
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) return savedTheme;

        // Default to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark',
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
};