import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';
import { LiveProvider, LivePreview, LiveError } from 'react-live';
import { FaUser, FaRobot, FaTrash } from 'react-icons/fa';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp?: string;
}

interface Code {
    jsx: string;
    css: string;
}

export default function SessionPage() {
    const router = useRouter();
    const { id } = router.query;
    const [session, setSession] = useState<any>(null);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [code, setCode] = useState<Code>({ jsx: '', css: '' });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id) return;
        const token = Cookies.get('token');
        if (!token) {
            router.replace('/login');
            return;
        }
        setError(null);
        axios.get(`/api/sessions/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setSession(res.data);
                setChat(res.data.chat || []);
                setCode(res.data.code || { jsx: '', css: '' });
            })
            .catch(() => {
                setError('Failed to load session.');
                setTimeout(() => router.replace('/dashboard'), 2000);
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    // Auto-save chat and code after every update
    useEffect(() => {
        if (!session || !session._id) return;
        if (loading) return;
        setSaving(true);
        const token = Cookies.get('token');
        axios.put(`/api/sessions/${session._id}`, {
            chat,
            code
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .catch(() => setError('Failed to auto-save session.'))
            .finally(() => setSaving(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chat, code]);

    useEffect(() => {
        // Remove any previous injected style
        let styleTag = document.getElementById('live-preview-style');
        if (styleTag) styleTag.remove();

        // Inject new style
        if (code.css && code.css.trim() !== '') {
            styleTag = document.createElement('style');
            styleTag.id = 'live-preview-style';
            styleTag.innerHTML = code.css;
            document.head.appendChild(styleTag);
        }
        // Cleanup on unmount
        return () => {
            let styleTag = document.getElementById('live-preview-style');
            if (styleTag) styleTag.remove();
        };
    }, [code.css]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setSending(true);
        setAiLoading(true);
        setError(null);
        const token = Cookies.get('token');
        const userMsg: ChatMessage = { role: 'user', content: input };
        setChat(prev => [...prev, userMsg]);
        setInput('');
        try {
            const res = await axios.post(`/api/sessions/${id}/chat`, { prompt: input }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChat(res.data.chat);
            setCode(res.data.code || { jsx: '', css: '' });
        } catch (err: any) {
            setError('AI failed to respond. Please try again.');
        } finally {
            setSending(false);
            setAiLoading(false);
        }
    };

    // Delete a single chat message
    const handleDeleteMessage = (index: number) => {
        setChat(prev => prev.filter((_, i) => i !== index));
    };
    // Clear all chat messages
    const handleClearChat = () => {
        setChat([]);
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-screen text-red-600">{error}</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Chat Side Panel */}
            <div className="w-full md:w-1/3 bg-gray-50 p-4 flex flex-col border-r border-gray-200 min-h-screen">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Chat</h2>
                    <button
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        onClick={handleClearChat}
                        title="Clear all chat"
                        aria-label="Clear all chat"
                    >
                        <FaTrash /> Clear All
                    </button>
                </div>
                {saving && <div className="text-xs text-gray-400 mb-1">Saving...</div>}
                <div className="flex-1 overflow-y-auto mb-2 max-h-[60vh] pr-2">
                    {chat.length === 0 && <div className="text-gray-400 text-center mt-8">No messages yet.</div>}
                    {chat.map((msg, i) => (
                        <div key={i} className={`mb-4 flex items-start group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && <FaRobot className="text-blue-500 mr-2 mt-1" aria-label="AI" />}
                            <div className={`relative max-w-[80%] px-4 py-2 rounded-lg shadow ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>
                                <span>{msg.content}</span>
                                <button
                                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                    onClick={() => handleDeleteMessage(i)}
                                    title="Delete message"
                                    aria-label="Delete message"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            {msg.role === 'user' && <FaUser className="text-gray-500 ml-2 mt-1" aria-label="User" />}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="Type your prompt..."
                        disabled={sending || aiLoading}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={sending || aiLoading}>
                        {sending || aiLoading ? '...' : 'Send'}
                    </button>
                </form>
            </div>
            {/* Main Preview Area */}
            <div className="flex-1 p-6 flex flex-col">
                <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
                <div className="border rounded bg-white min-h-[300px] mb-4 flex flex-col items-center justify-center">
                    <LiveProvider code={code.jsx}>
                        <LivePreview className="p-4" />
                        <LiveError className="text-red-600 p-2" />
                    </LiveProvider>
                </div>
                {/* Code Tabs */}
                <div className="bg-gray-100 rounded p-4">
                    <h3 className="font-semibold mb-2">JSX/TSX</h3>
                    <textarea
                        className="bg-white p-2 rounded overflow-x-auto mb-4 w-full h-40 border"
                        value={code.jsx}
                        onChange={e => setCode(c => ({ ...c, jsx: e.target.value }))}
                        spellCheck={false}
                    />
                    <h3 className="font-semibold mb-2">CSS</h3>
                    <textarea
                        className="bg-white p-2 rounded overflow-x-auto w-full h-24 border"
                        value={code.css}
                        onChange={e => setCode(c => ({ ...c, css: e.target.value }))}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
} 