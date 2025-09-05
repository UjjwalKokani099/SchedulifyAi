import React, { useState, useEffect, useCallback } from 'react';
import { getReminders, addReminder, deleteReminder } from '../services/firestoreService';
import type { CustomReminder } from '../types';
import { BellIcon, LoaderIcon, XIcon } from './icons';
import { useToast } from './ToastProvider';

export const CustomReminders: React.FC<{ userId: string }> = ({ userId }) => {
    const [reminders, setReminders] = useState<CustomReminder[]>([]);
    const [message, setMessage] = useState('');
    const [time, setTime] = useState('');
    const [permission, setPermission] = useState(Notification.permission);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchReminders = useCallback(async () => {
        setIsLoading(true);
        try {
            const userReminders = await getReminders(userId);
            setReminders(userReminders);
        } catch (err) {
            setError("Could not fetch your reminders.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);
    
    useEffect(() => {
        if (permission !== 'granted') {
            // No need to run the interval if we don't have permission.
            return;
        }

        const intervalId = setInterval(() => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            setReminders(currentReminders => {
                const triggeredReminders: CustomReminder[] = [];
                
                const remainingReminders = currentReminders.filter(reminder => {
                    if (reminder.time === currentTime) {
                        triggeredReminders.push(reminder);
                        return false; // This will remove the reminder from the state
                    }
                    return true;
                });

                if (triggeredReminders.length > 0) {
                    triggeredReminders.forEach(reminder => {
                        new Notification('Schedulify Reminder', {
                            body: reminder.message,
                            icon: '/vite.svg',
                        });
                        
                        // Asynchronously delete from Firestore, and handle potential errors.
                        deleteReminder(userId, reminder.id)
                            .catch(err => {
                                console.error("Failed to delete triggered reminder from Firestore:", err);
                                // This toast is important for user feedback if DB fails
                                addToast(`Failed to clear reminder: ${reminder.message}`, 'error');
                            });
                    });
                    // Only return a new array if something changed, to prevent unnecessary re-renders.
                    return remainingReminders;
                }
                
                // If no reminders were triggered, return the original array to avoid re-renders.
                return currentReminders;
            });

        }, 60000); // Check every minute

        // Cleanup function to clear the interval when the component unmounts or deps change.
        return () => clearInterval(intervalId);
    }, [permission, userId, addToast]);


    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== 'granted') {
            setError('Notification permission is required to set reminders.');
        } else {
            setError(null);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || !time) {
            addToast("Please provide a message and a time.", 'error');
            return;
        }
        
        if (permission !== 'granted') {
            await requestPermission();
            // Re-check after asking
            if (Notification.permission !== 'granted') return;
        }

        setError(null);
        const newReminderData = { userId, message, time };
        try {
            const newId = await addReminder(userId, newReminderData);
            setReminders(prev => [...prev, { id: newId, ...newReminderData }]);
            setMessage('');
            setTime('');
            addToast('Reminder added!', 'success');
        } catch (err) {
            addToast('Failed to save reminder.', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteReminder(userId, id);
            setReminders(prev => prev.filter(r => r.id !== id));
            addToast('Reminder deleted.', 'info');
        } catch (err) {
            addToast('Failed to delete reminder.', 'error');
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Custom Reminders</h2>

            {permission !== 'granted' && (
                <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
                    <p className="font-bold">Enable Notifications</p>
                    <p className="text-sm">To receive reminders, you need to allow notifications from this site.</p>
                    {permission === 'default' && 
                        <button onClick={requestPermission} className="mt-2 px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600">
                            Allow Notifications
                        </button>
                    }
                </div>
            )}
            
            <form onSubmit={handleAdd} className="space-y-4 mb-6">
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reminder Message</label>
                    <input
                        id="message"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Drink water"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                        <input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-[42px]"
                    >
                        Add Reminder
                    </button>
                </div>
            </form>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            
            <div className="flex-grow overflow-y-auto">
                <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">Active Reminders</h3>
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <LoaderIcon className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : reminders.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">You have no active reminders.</p>
                ) : (
                    <ul className="space-y-2">
                        {reminders.sort((a,b) => a.time.localeCompare(b.time)).map(reminder => (
                            <li key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{reminder.message}</p>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{reminder.time}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(reminder.id)}
                                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                    aria-label="Delete reminder"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};