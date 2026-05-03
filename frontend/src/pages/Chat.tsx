import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { FormEvent } from 'react';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import api from '../api';

const Chat = () => {
    const location = useLocation();
    const { summaryId, source } = (location.state as any) || {};

    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (summaryId && source) {
            initializeChat();
        }
    }, [summaryId, source]);

    const initializeChat = async () => {
        setLoading(true);
        try {
            const res = await api.post('/chatWithAi/enterToChat', {
                summaryId,
                source
            });
            if (res.data && res.data.result) {
                const history = res.data.result.map((m: any) => ({
                    role: m.messageType === 'human' ? 'user' : 'ai',
                    text: m.content
                }));
                setMessages(history);
            }
        } catch (err) {
            console.error('Failed to initialize chat context', err);
            setError('Could not load chat context. Starting standard chat.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            const endpoint = summaryId && source ? '/chatWithAi/' : '/chatWithAi/chat'; 
            const payload = summaryId && source 
                ? { content: userMsg, source, summaryId }
                : { message: userMsg };

            const res = await api.post(endpoint, payload);
            
            let reply = 'Received response.';
            if (summaryId && source) {
                // Endpoint /chatWithAi/ returns array of totalResponse
                const aiMsg = res.data?.result?.find((m: any) => m.messageType === 'ai');
                reply = aiMsg?.content || reply;
            } else {
                reply = res.data?.data?.reply || reply;
            }

            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to AI...' }]);
            setError('Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    if (!summaryId || !source) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-indigo-500" />
                        Chat with AI
                    </h1>
                    <p className="text-slate-500 mt-2">Ask questions about your uploaded documents or videos.</p>
                </div>
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">No Content Selected</h2>
                    <p className="text-slate-500 mt-2 max-w-md">
                        Please generate a summary first, then click on "Chat with AI" to start a contextual discussion.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-indigo-500" />
                    Contextual AI Chat
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Discussing: <span className="text-indigo-600">Generated Summary</span></p>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                            <p>Start a conversation with your AI assistant</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-4 rounded-2xl bg-slate-100 text-slate-500 rounded-tl-none flex gap-2 items-center">
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none block"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
