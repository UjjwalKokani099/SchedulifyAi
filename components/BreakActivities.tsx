import React, { useState } from 'react';
import { getBreakActivitySuggestion } from '../services/geminiService';
import { CoffeeIcon, LoaderIcon } from './icons';
import type { BreakActivityType, BreakActivitySuggestion, MindfulnessActivity, PuzzleActivity, SuggestionActivity } from '../types';

const CATEGORIES: { name: string, type: BreakActivityType }[] = [
    { name: "Mindfulness", type: 'Mindfulness' },
    { name: "Quick Puzzle", type: 'Puzzle' },
    { name: "Creative", type: 'Creative' },
    { name: "Physical", type: 'Physical' },
];

const MindfulnessRenderer = ({ activity }: { activity: MindfulnessActivity }) => (
    <div className="text-left">
        <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-4 text-center">{activity.title}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex-shrink-0 animate-pulse-slow"></div>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {activity.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
        </div>
        <style>{`.animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; } @keyframes pulse { 50% { opacity: .5; } }`}</style>
    </div>
);

const PuzzleRenderer = ({ activity }: { activity: PuzzleActivity }) => {
    const [guess, setGuess] = useState('');
    const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
    const [revealed, setRevealed] = useState(false);

    const checkAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (guess.trim().toLowerCase() === activity.answer.toLowerCase()) {
            setResult('correct');
        } else {
            setResult('incorrect');
            setTimeout(() => setResult(null), 1500);
        }
    };

    const isDone = result === 'correct' || revealed;

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-2">{activity.title}</h3>
            <p className="text-4xl font-bold tracking-widest my-4 text-gray-800 dark:text-gray-200">{activity.jumbledWord}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">Hint: {activity.hint}</p>

            {isDone ? (
                <div className="p-4 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-lg">
                    <p className="font-bold">Correct! The answer is: {activity.answer}</p>
                </div>
            ) : (
                <form onSubmit={checkAnswer} className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Your answer"
                        className={`block w-full sm:w-auto flex-grow px-3 py-2 bg-white border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white dark:border-gray-600 ${result === 'incorrect' ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                    />
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700">
                        Check
                    </button>
                </form>
            )}

            {!isDone && (
                <button onClick={() => setRevealed(true)} className="text-xs text-gray-500 hover:underline mt-2 dark:text-gray-400">
                    Reveal Answer
                </button>
            )}
            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

const SuggestionRenderer = ({ activity }: { activity: SuggestionActivity }) => (
    <div className="text-center">
        <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-2">{activity.title}</h3>
        <p className="text-gray-700 dark:text-gray-300">{activity.description}</p>
    </div>
);

export const BreakActivities: React.FC = () => {
    const [suggestion, setSuggestion] = useState<BreakActivitySuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<BreakActivityType>('Mindfulness');

    const fetchSuggestion = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestion(null);
        try {
            const result = await getBreakActivitySuggestion(selectedCategory);
            setSuggestion(result);
        } catch (err) {
            setError('Sorry, I couldn\'t think of anything right now. Please try again!');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderSuggestion = () => {
        if (!suggestion) return null;
        switch (suggestion.type) {
            case 'Mindfulness':
                return <MindfulnessRenderer activity={suggestion} />;
            case 'Puzzle':
                return <PuzzleRenderer activity={suggestion} />;
            case 'Creative':
            case 'Physical':
                return <SuggestionRenderer activity={suggestion} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg max-w-lg w-full">
                <CoffeeIcon className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Time for a Break?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Choose a break type, and I'll suggest a fun, refreshing activity.
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {CATEGORIES.map(({ name, type }) => (
                        <button
                            key={type}
                            onClick={() => setSelectedCategory(type)}
                            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                                selectedCategory === type
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchSuggestion}
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all duration-300 transform hover:scale-105"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
                            Thinking...
                        </span>
                    ) : (
                        "Suggest an Activity"
                    )}
                </button>

                {error && <p className="text-red-500 mt-4">{error}</p>}

                {suggestion && !isLoading && (
                    <div className="mt-8 p-6 bg-indigo-50 dark:bg-gray-900/50 border border-indigo-200 dark:border-gray-700 rounded-lg animate-fade-in">
                        {renderSuggestion()}
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};