import React, { useState, useMemo } from 'react';
// Fix: Replaced direct import from 'firebase/auth' with the centralized User type from '../types'.
import type { User } from '../types';
import { updateUserProfile } from '../services/firebaseService';
import { useToast } from './ToastProvider';
import { LoaderIcon, XIcon } from './icons';

const AVATARS = ['😊', '🥳', '😎', '😍', '😇', '🤔', '😂', '🤯', '🤩', '🤓', '🤖', '👻'];

// Helper to convert emoji to a data URL for photoURL
const emojiToDataUrl = (emoji: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Helper to check if a URL is an emoji data URL and extract the emoji
const dataUrlToEmoji = (url: string | null | undefined): string | null => {
    if (!url || !url.startsWith('data:image/svg+xml')) return null;
    try {
        const decoded = decodeURIComponent(url.split(',')[1]);
        const match = decoded.match(/<text.*>(.*)<\/text>/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
};

interface ProfileEditorProps {
    user: User;
    onClose: () => void;
    onProfileUpdate: (updatedData: { displayName?: string, photoURL?: string }) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onClose, onProfileUpdate }) => {
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [selectedAvatar, setSelectedAvatar] = useState(dataUrlToEmoji(user.photoURL) || AVATARS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const originalName = user.displayName || '';
    const originalAvatar = dataUrlToEmoji(user.photoURL) || AVATARS[0];

    const isChanged = useMemo(() => {
        return displayName !== originalName || selectedAvatar !== originalAvatar;
    }, [displayName, selectedAvatar, originalName, originalAvatar]);

    const handleSave = async () => {
        if (!displayName.trim()) {
            addToast('Username cannot be empty.', 'error');
            return;
        }
        if (!isChanged) return;
        
        setIsLoading(true);
        try {
            const avatarUrl = emojiToDataUrl(selectedAvatar);
            await updateUserProfile({ displayName, photoURL: avatarUrl });
            onProfileUpdate({ displayName, photoURL: avatarUrl });
            addToast('Profile updated successfully!', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Failed to update profile.';
            addToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Choose your Avatar
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                            {AVATARS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setSelectedAvatar(emoji)}
                                    className={`text-3xl p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                        selectedAvatar === emoji
                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 scale-110'
                                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isChanged || isLoading}
                        className="px-4 py-2 w-32 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed dark:disabled:bg-indigo-800"
                    >
                       {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};