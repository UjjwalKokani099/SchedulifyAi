
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundingSource } from '../types';
import { getChatbotResponseStream } from '../services/geminiService';
import { BotIcon, SendIcon, UserIcon, LoaderIcon } from './icons';

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
              className="text-indigo-400 hover:underline"
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

export const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', parts: [{text: "Hello! I'm Schedulify AI. How can I help you with your studies today?"}] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        const currentHistory = [...messages, newUserMessage];
        
        try {
            const stream = await getChatbotResponseStream(currentHistory, input);
            let firstChunk = true;
            let sources: GroundingSource[] = [];

            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }], sources: [] }]);

            for await (const chunk of stream) {
                if (firstChunk) {
                    sources = chunk.sources || [];
                    firstChunk = false;
                }
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'model') {
                        const updatedText = (lastMessage.parts[0]?.text || '') + chunk.text;
                        const updatedLastMessage: ChatMessage = { ...lastMessage, parts: [{ text: updatedText }], sources: sources };
                        return [...prev.slice(0, -1), updatedLastMessage];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-900 text-white flex flex-col h-full rounded-2xl shadow-2xl">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold">Schedulify AI Tutor</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><BotIcon className="w-5 h-5" /></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
                            <div className="whitespace-pre-wrap break-words">
                                <LinkifyText text={msg.parts[0]?.text || ''} />
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-600">
                                    <h4 className="text-xs font-semibold mb-1 text-gray-400">Sources:</h4>
                                    <ul className="text-xs space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                         {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon className="w-5 h-5" /></div>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><BotIcon className="w-5 h-5" /></div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-800 flex items-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2 delay-150"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-gray-800 border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed" disabled={isLoading}>
                       {isLoading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <SendIcon className="w-6 h-6" />}
                    </button>
                </form>
            </div>
        </div>
    );
};