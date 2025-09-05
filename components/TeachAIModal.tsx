import React, { useState } from 'react';
import { XIcon } from './icons';

interface TeachAIModalProps {
    onClose: () => void;
    onSave: (knowledge: string[]) => void;
    currentKnowledge: string[];
}

export const TeachAIModal: React.FC<TeachAIModalProps> = ({ onClose, onSave, currentKnowledge }) => {
    const [knowledgeList, setKnowledgeList] = useState<string[]>(currentKnowledge);
    const [newKnowledge, setNewKnowledge] = useState('');

    const handleAdd = () => {
        if (newKnowledge.trim()) {
            setKnowledgeList(prev => [...prev, newKnowledge.trim()]);
            setNewKnowledge('');
        }
    };

    const handleDelete = (index: number) => {
        setKnowledgeList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(knowledgeList);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Teach Schedulify AI</h2>
                        <p className="text-gray-600 dark:text-gray-400">Add context for the AI to remember during your chats.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="mb-4">
                        <label htmlFor="knowledge-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add new information</label>
                        <div className="flex gap-2">
                            <textarea
                                id="knowledge-input"
                                rows={2}
                                value={newKnowledge}
                                onChange={e => setNewKnowledge(e.target.value)}
                                placeholder="e.g., I prefer learning with real-world examples."
                                className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                            <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 self-end">
                                Add
                            </button>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Current Knowledge</h3>
                    {knowledgeList.length > 0 ? (
                        <ul className="space-y-2">
                            {knowledgeList.map((item, index) => (
                                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{item}</p>
                                    <button onClick={() => handleDelete(index)} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No custom knowledge added yet.</p>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 rounded-b-2xl flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                        Save and Close
                    </button>
                </div>
            </div>
        </div>
    );
};