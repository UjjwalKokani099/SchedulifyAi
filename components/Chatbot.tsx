// Fix: Add SpeechRecognition types to the global Window object to resolve TypeScript errors.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundingSource } from '../types';
import { getChatbotResponseStream } from '../services/geminiService';
import { BotIcon, SendIcon, UserIcon, LoaderIcon, MicrophoneIcon } from './icons';
import type { ToastType } from './ToastProvider';

// Helper component to find and render links in text
const LinkifyText = ({ text }: { text: string }) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
  
    return (
      <>
        {parts.map((part, i) =>
          urlRegex.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </>
    );
  };

interface ChatbotProps {
    customKnowledge: string[];
    isTTSEnabled: boolean;
    stopTTS: () => void;
    addToast: (message: string, type: ToastType) => void;
}

const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export const Chatbot: React.FC<ChatbotProps> = ({ customKnowledge, isTTSEnabled, stopTTS, addToast }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', parts: [{text: "Hello! I'm Schedulify AI. How can I help you with your studies today? Try clicking the mic!"}] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setInput(finalTranscript + interimTranscript);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            addToast(`Voice input error: ${event.error}`, 'error');
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [addToast]);
    
    const speak = (text: string) => {
        if (!isTTSEnabled || !text) return;
        try {
            stopTTS(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Text-to-speech failed.", e);
            addToast("Sorry, I couldn't speak the response.", "error");
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;
        
        stopTTS(); // Stop AI speaking when user sends a message
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const currentHistory = [...messages, newUserMessage];
        let accumulatedResponse = "";
        
        try {
            const stream = await getChatbotResponseStream(currentHistory, currentInput, customKnowledge);
            let firstChunk = true;
            let sources: GroundingSource[] = [];

            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }], sources: [] }]);

            for await (const chunk of stream) {
                accumulatedResponse += chunk.text;
                if (firstChunk) {
                    sources = chunk.sources || [];
                    firstChunk = false;
                }
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'model') {
                        const updatedLastMessage: ChatMessage = { ...lastMessage, parts: [{ text: accumulatedResponse }], sources: sources };
                        return [...prev.slice(0, -1), updatedLastMessage];
                    }
                    return prev;
                });
            }
            speak(accumulatedResponse);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleListening = () => {
        if (!isSpeechRecognitionSupported) {
            addToast("Sorry, your browser doesn't support voice input.", 'error');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            stopTTS();
            setInput('');
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"><BotIcon className="w-5 h-5" /></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'}`}>
                            <div className="whitespace-pre-wrap break-words">
                                <LinkifyText text={msg.parts[0]?.text || ''} />
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <h4 className="text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Sources:</h4>
                                    <ul className="text-xs space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                         {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"><UserIcon className="w-5 h-5" /></div>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"><BotIcon className="w-5 h-5" /></div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
                            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse mr-2"></div>
                            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse mr-2 delay-150"></div>
                            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Ask me anything..."}
                        className="flex-1 bg-gray-100 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={isLoading}
                    />
                    <button 
                        type="button" 
                        onClick={toggleListening}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'}`}
                        disabled={!isSpeechRecognitionSupported}
                        title="Use voice input"
                    >
                        <MicrophoneIcon className="w-6 h-6" />
                    </button>
                    <button type="submit" className="bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed" disabled={isLoading || !input.trim()}>
                       {isLoading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <SendIcon className="w-6 h-6" />}
                    </button>
                </form>
            </div>
        </div>
    );
};