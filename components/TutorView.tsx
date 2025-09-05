import React, { useState, useEffect } from 'react';
import { Chatbot } from './Chatbot';
import { TeachAIModal } from './TeachAIModal';
import { BrainCogIcon, Volume2Icon, VolumeXIcon } from './icons';
import { clearChatInstance } from '../services/geminiService';
import { useToast } from './ToastProvider';

export const TutorView: React.FC = () => {
    const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);
    const [customKnowledge, setCustomKnowledge] = useState<string[]>([]);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        try {
            const storedKnowledge = localStorage.getItem('schedulify-ai-knowledge');
            if (storedKnowledge) {
                setCustomKnowledge(JSON.parse(storedKnowledge));
            }
            const storedTTS = localStorage.getItem('schedulify-tts-enabled');
            if (storedTTS) {
                setIsTTSEnabled(JSON.parse(storedTTS));
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }, []);

    const handleSaveKnowledge = (newKnowledge: string[]) => {
        setCustomKnowledge(newKnowledge);
        localStorage.setItem('schedulify-ai-knowledge', JSON.stringify(newKnowledge));
        clearChatInstance(); // Reset the chatbot instance with new context
        addToast('AI knowledge updated!', 'success');
    };

    const toggleTTS = () => {
        const newTTSState = !isTTSEnabled;
        setIsTTSEnabled(newTTSState);
        localStorage.setItem('schedulify-tts-enabled', JSON.stringify(newTTSState));
        if (!newTTSState) {
            speechSynthesis.cancel();
        }
        addToast(`AI voice ${newTTSState ? 'enabled' : 'disabled'}.`, 'info');
    };

    const stopTTS = () => {
        speechSynthesis.cancel();
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-gray-100">Schedulify AI Tutor</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTTS}
                        className="p-1.5 text-sm font-medium text-indigo-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-indigo-300"
                        title={isTTSEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
                    >
                        {isTTSEnabled ? <Volume2Icon className="w-5 h-5" /> : <VolumeXIcon className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={() => setIsTeachModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-indigo-300"
                        title="Teach the AI custom information"
                    >
                        <BrainCogIcon className="w-5 h-5" />
                        Teach AI
                    </button>
                </div>
            </div>
            <Chatbot 
                customKnowledge={customKnowledge} 
                isTTSEnabled={isTTSEnabled}
                stopTTS={stopTTS}
                addToast={addToast}
            />
            {isTeachModalOpen && (
                <TeachAIModal 
                    onClose={() => setIsTeachModalOpen(false)}
                    onSave={handleSaveKnowledge}
                    currentKnowledge={customKnowledge}
                />
            )}
        </div>
    );
};