import React, { useState } from 'react';
import { UploadCloudIcon, FileTextIcon } from './icons';

interface MockFile {
    name: string;
    type: 'pdf' | 'docx' | 'png';
    size: string;
}

const MOCK_FILES: MockFile[] = [
    { name: 'Physics_Chapter_4_Notes.pdf', type: 'pdf', size: '1.2 MB' },
    { name: 'Maths_Practice_Test_1.docx', type: 'docx', size: '45 KB' },
    { name: 'Trigonometry_Formulas.png', type: 'png', size: '230 KB' },
];

export const StudyWork: React.FC = () => {
    const [files, setFiles] = useState<MockFile[]>(MOCK_FILES);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        // In a real app, you would handle the file upload here.
        // For this UI, we'll just show an alert.
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            alert(`Simulated upload of ${e.dataTransfer.files[0].name}. This is a UI demo.`);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                 <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                    <UploadCloudIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Study Work</h2>
                    <p className="text-gray-600 dark:text-gray-300">Upload and manage your notes, assignments, and practice papers.</p>
                </div>
            </div>
            
            <div 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50'}`}
            >
                <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Drag and drop your files here</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">or</p>
                <button className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700">
                    Browse Files
                </button>
                <p className="text-xs text-gray-400 mt-2">PDF, DOCX, PNG, JPG supported</p>
            </div>

            <div className="mt-8 flex-grow overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Files</h3>
                <ul className="space-y-3">
                    {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-700">
                            <div className="flex items-center gap-3">
                                <FileTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-200">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{file.size}</p>
                                </div>
                            </div>
                            <button className="text-xs text-red-500 hover:underline font-semibold dark:text-red-400">Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};