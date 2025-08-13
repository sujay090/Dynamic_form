import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { cn } from '@/lib/utils';
import { chatbotService, type ChatMessage } from '../../API/services/chatbotService';
import robotPng from "../../assets/robo.png";

interface ChatbotProps {
    primaryColor?: string;
    siteName?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({
    primaryColor = '#059669',
    siteName = 'Institute'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize welcome message
    useEffect(() => {
        const welcomeMessage = chatbotService.getWelcomeMessage(siteName);
        setMessages([welcomeMessage]);
    }, [siteName]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputMessage.trim(),
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await chatbotService.sendMessage(inputMessage.trim());

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: response.message,
                isUser: false,
                timestamp: new Date(response.timestamp)
            };

            setTimeout(() => {
                setMessages(prev => [...prev, botMessage]);
                setSuggestions(response.suggestions || []);
                setIsTyping(false);
            }, 1000);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I\'m having trouble responding right now. Please try again later.',
                isUser: false,
                timestamp: new Date()
            };

            setTimeout(() => {
                setMessages(prev => [...prev, errorMessage]);
                setSuggestions([]);
                setIsTyping(false);
            }, 1000);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputMessage(suggestion);
        // Automatically send the message
        setTimeout(() => {
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                text: suggestion,
                isUser: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');
            setIsTyping(true);
            setSuggestions([]);

            chatbotService.sendMessage(suggestion).then(response => {
                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response.message,
                    isUser: false,
                    timestamp: new Date(response.timestamp)
                };

                setTimeout(() => {
                    setMessages(prev => [...prev, botMessage]);
                    setSuggestions(response.suggestions || []);
                    setIsTyping(false);
                }, 1000);
            }).catch(error => {
                console.error('Error:', error);
                setIsTyping(false);
            });
        }, 100);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Chat Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-24 h-20 transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative group p-0 bg-transparent border-none hover:bg-transparent"
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                >
                    <img
                        src={robotPng}
                        alt="Max Robot Assistant"
                        className="w-full h-full object-contain"
                        style={{
                            filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 24px rgba(59, 130, 246, 0.3)) drop-shadow(0 0 36px rgba(59, 130, 246, 0.2))',
                            transition: 'filter 0.3s ease'
                        }}
                    />
                </Button>
            </div>

            {/* Chat Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className="fixed bottom-20 right-4 sm:max-w-[400px] h-[600px] p-0 flex flex-col transform-none translate-x-0 translate-y-0"
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '16px',
                        top: 'auto',
                        left: 'auto',
                        transform: 'none'
                    }}
                >
                    <DialogHeader className="p-4 border-b flex-shrink-0" style={{ borderBottomColor: `${primaryColor}20` }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={robotPng}
                                    alt="Max Robot"
                                    className="w-10 h-10 object-contain"
                                    style={{
                                        filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.2))'
                                    }}
                                />
                                <div>
                                    <DialogTitle className="text-lg font-semibold">
                                        Max - {siteName} Assistant
                                    </DialogTitle>
                                    <p className="text-sm text-gray-500">Online now</p>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex',
                                    message.isUser ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <div className={cn('flex space-x-2 max-w-[80%]', message.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row')}>
                                    {message.isUser ? (
                                        <User className="h-8 w-8 text-gray-600 flex-shrink-0" />
                                    ) : (
                                        <img
                                            src={robotPng}
                                            alt="Max Robot"
                                            className="w-12 h-12 object-contain flex-shrink-0"
                                            style={{
                                                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.2))'
                                            }}
                                        />
                                    )}

                                    <div className="space-y-1">
                                        <div
                                            className={cn(
                                                'px-4 py-2 rounded-2xl text-sm',
                                                message.isUser
                                                    ? 'text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            )}
                                            style={{
                                                backgroundColor: message.isUser ? primaryColor : undefined,
                                            }}
                                        >
                                            {message.text}
                                        </div>
                                        <div className={cn('text-xs text-gray-500', message.isUser ? 'text-right' : 'text-left')}>
                                            {formatTime(message.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex space-x-2 max-w-[80%]">
                                    <img
                                        src={robotPng}
                                        alt="Max Robot"
                                        className="w-10 h-10 object-contain flex-shrink-0"
                                        style={{
                                            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.2))'
                                        }}
                                    />

                                    <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && !isTyping && (
                        <div className="px-4 py-2 border-t border-b" style={{ borderColor: `${primaryColor}20` }}>
                            <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1 rounded-full text-xs border border-gray-200 hover:border-gray-300 transition-colors"
                                        style={{
                                            backgroundColor: `${primaryColor}10`,
                                            color: primaryColor
                                        }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t flex-shrink-0" style={{ borderTopColor: `${primaryColor}20` }}>
                        <div className="flex space-x-2">
                            <Input
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1"
                                disabled={isTyping}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                size="icon"
                                style={{ backgroundColor: primaryColor }}
                                className="text-white"
                            >
                                {isTyping ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Ask me about courses, admission, fees, and more!
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Chatbot;
