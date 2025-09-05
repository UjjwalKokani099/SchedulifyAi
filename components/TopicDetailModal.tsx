import React, { useState, useEffect } from 'react';
import type { ScheduleItem, TopicResourceSet, QuizAttempt, Flashcard } from '../types';
import { getTopicResources } from '../services/geminiService';
import { LoaderIcon, XIcon, YoutubeIcon, FileTextIcon, LightbulbIcon, LayersIcon } from './icons';

const HubTab = ({ label, icon: Icon, isActive, onClick }: { label: string, icon: React.FC<{className?: string}>, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);

const FlashcardViewer = ({ flashcards }: { flashcards: Flashcard[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!flashcards || flashcards.length === 0) {
        return <div className="text-center text-gray-500 py-8">No flashcards available for this topic.</div>;
    }

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev + 1) % flashcards.length), 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length), 150);
    };

    const card = flashcards[currentIndex];

    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-lg h-64 perspective-1000 mb-4">
                <div 
                    className={`relative w-full h-full preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-700 border-2 border-indigo-300 dark:border-indigo-500 rounded-xl flex items-center justify-center p-6 text-center cursor-pointer shadow-lg">
                        <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{card.question}</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-300 dark:border-indigo-500 rounded-xl flex items-center justify-center p-6 text-center cursor-pointer shadow-lg rotate-y-180">
                        <p className="text-lg text-gray-700 dark:text-gray-200">{card.answer}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between w-full max-w-lg">
                <button onClick={prevCard} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Previous</button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{currentIndex + 1} / {flashcards.length}</span>
                <button onClick={nextCard} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700">Next</button>
            </div>
        </div>
    );
};

export const TopicDetailModal: React.FC<{ item: ScheduleItem, onClose: () => void }> = ({ item, onClose }) => {
    const [resources, setResources] = useState<TopicResourceSet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<QuizAttempt>({});
    const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
    const [activeHubTab, setActiveHubTab] = useState<'Resources' | 'Quiz' | 'Flashcards'>('Resources');

    useEffect(() => {
        const fetchResources = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await getTopicResources(item.subject, item.topic);
                setResources(res);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load resources.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, [item]);
    
    const handleQuizAnswer = (questionIndex: number, option: string) => {
        setQuizAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleQuizSubmit = () => {
        setIsQuizSubmitted(true);
    };

    const renderQuizScore = () => {
        if (!resources || !isQuizSubmitted) return null;
        const correctAnswers = resources.quiz.reduce((score, question, index) => {
            return score + (quizAnswers[index] === question.correctAnswer ? 1 : 0);
        }, 0);
        return (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-center">
                <p className="font-bold text-lg text-indigo-800 dark:text-indigo-300">
                    You scored {correctAnswers} out of {resources.quiz.length}!
                </p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{item.topic}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{item.subject} - Study Hub</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <LoaderIcon className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                            <p>Finding the best resources for you...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-600 p-8">
                            <p className="font-semibold">Failed to load resources</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {resources && !isLoading && (
                       <div>
                            <div className="flex items-center gap-2 border-b dark:border-gray-700 mb-4 pb-2">
                                <HubTab label="Resources" icon={FileTextIcon} isActive={activeHubTab === 'Resources'} onClick={() => setActiveHubTab('Resources')} />
                                <HubTab label="Quiz" icon={LightbulbIcon} isActive={activeHubTab === 'Quiz'} onClick={() => setActiveHubTab('Quiz')} />
                                <HubTab label="Flashcards" icon={LayersIcon} isActive={activeHubTab === 'Flashcards'} onClick={() => setActiveHubTab('Flashcards')} />
                            </div>
                            
                            {activeHubTab === 'Resources' && (
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                            <YoutubeIcon className="w-5 h-5" /> Recommended Videos
                                        </h3>
                                        <ul className="space-y-2">
                                            {resources.videos.map((video, i) => (
                                                <li key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-700/50 dark:hover:bg-gray-700">
                                                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium dark:text-blue-400">{video.title}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                    
                                    <section>
                                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                            <FileTextIcon className="w-5 h-5" /> Study Notes & Articles
                                        </h3>
                                        <ul className="space-y-2">
                                            {resources.notes.map((note, i) => (
                                                <li key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-700/50 dark:hover:bg-gray-700">
                                                    <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium dark:text-blue-400">{note.title}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>
                            )}

                            {activeHubTab === 'Quiz' && (
                                <section>
                                    <div className="space-y-4">
                                        {resources.quiz.map((q, qIndex) => (
                                            <div key={qIndex} className="p-4 border dark:border-gray-700 rounded-lg">
                                                <p className="font-semibold mb-3">{qIndex + 1}. {q.question}</p>
                                                <div className="space-y-2">
                                                    {q.options.map((option, oIndex) => {
                                                        const isSelected = quizAnswers[qIndex] === option;
                                                        const isCorrect = q.correctAnswer === option;
                                                        
                                                        let optionClasses = "w-full text-left p-2 rounded-md border text-sm ";
                                                        if (isQuizSubmitted) {
                                                            optionClasses += " cursor-default";
                                                            if (isCorrect) {
                                                                optionClasses += " bg-green-100 border-green-300 text-green-900 font-semibold dark:bg-green-900/50 dark:border-green-700 dark:text-green-300";
                                                            } else if (isSelected && !isCorrect) {
                                                                optionClasses += " bg-red-100 border-red-300 text-red-900 line-through dark:bg-red-900/50 dark:border-red-700 dark:text-red-300";
                                                            } else {
                                                                 optionClasses += " bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400";
                                                            }
                                                        } else {
                                                            optionClasses += " cursor-pointer transition-colors";
                                                            optionClasses += isSelected ? " bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300 dark:bg-indigo-900/50 dark:border-indigo-500" : " bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600";
                                                        }
                                                        
                                                        return (
                                                            <button 
                                                                key={oIndex} 
                                                                onClick={() => !isQuizSubmitted && handleQuizAnswer(qIndex, option)}
                                                                disabled={isQuizSubmitted}
                                                                className={optionClasses}
                                                            >
                                                                {option}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!isQuizSubmitted ? (
                                        <button onClick={handleQuizSubmit} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Submit Quiz
                                        </button>
                                    ) : renderQuizScore()}
                                </section>
                            )}

                            {activeHubTab === 'Flashcards' && (
                                <section>
                                    <FlashcardViewer flashcards={resources.flashcards} />
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};