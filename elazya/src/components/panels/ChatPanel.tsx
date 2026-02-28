import { useState, useRef, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionKey] = useState(() => `session_${Date.now()}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Use the OpenClaw send message endpoint
            const response = await OpenClawClient.request('chat.send', {
                sessionKey,
                message: userMessage.content
            });

            const assistantMessage: Message = {
                id: `msg_${Date.now()}_response`,
                role: 'assistant',
                content: response?.text || response?.message || 'Réponse reçue',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage: Message = {
                id: `msg_${Date.now()}_error`,
                role: 'assistant',
                content: `Erreur: ${err}. Assurez-vous que le moteur OpenClaw est en cours d'exécution.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-indigo-400" />
                        Chat
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Discutez directement avec Elazya</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Session active
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Bienvenue !</h3>
                        <p className="text-sm text-zinc-500 max-w-md">
                            Posez une question ou donnez un ordre à Elazya. Elle peut utiliser vos skills installés pour accomplir des tâches.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[70%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-indigo-500 text-white rounded-tr-md'
                                : 'bg-white/5 border border-white/5 text-white rounded-tl-md'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-black/50' : 'text-zinc-500'}`}>
                                {msg.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-zinc-300" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-md">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-4 border-t border-white/5">
                <div className="flex gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Écrivez votre message..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
