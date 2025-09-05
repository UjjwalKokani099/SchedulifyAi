import React from 'react';
import { useTheme } from './ThemeContext';
import { SunIcon, MoonIcon } from './icons';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <span
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    theme === 'light' ? 'translate-x-0' : 'translate-x-6'
                }`}
            >
                {theme === 'light' ? (
                    <SunIcon className="w-4 h-4 text-yellow-500" />
                ) : (
                    <MoonIcon className="w-4 h-4 text-indigo-400" />
                )}
            </span>
        </button>
    );
};
