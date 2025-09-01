import React from 'react';
import { SchedulifyLogoIcon, LoaderIcon } from './icons';

export const SplashScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center text-center p-4">
            <div className="flex items-center gap-4 mb-6">
                <SchedulifyLogoIcon className="h-16 w-16" />
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                    SchedulifyAI
                </h1>
            </div>
            <LoaderIcon className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
    );
};
