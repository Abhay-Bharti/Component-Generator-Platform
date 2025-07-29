import { FaUser, FaRobot, FaTrash } from 'react-icons/fa';
import React from 'react';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

interface ChatPanelProps {
    chat: ChatMessage[];
    input: string;
    setInput: (input: string) => void;
    onSend: (e: React.FormEvent) => void;
    onDeleteMessage: (index: number) => void;
    onClearChat: () => void;
    sending: boolean;
    aiLoading: boolean;
    saving: boolean;
}

export default function ChatPanel({
    chat,
    input,
    setInput,
    onSend,
    onDeleteMessage,
    onClearChat,
    sending,
    aiLoading,
    saving
}: ChatPanelProps) {
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    return (
        <div className="w-full h-full bg-gray-50 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
            </div>

            {saving && <div className="text-xs text-gray-500 mb-2">Saving...</div>}

            <div className="flex-1 overflow-y-auto mb-4 pr-2">
                {chat.length === 0 && (
                    <div className="text-gray-500 text-center mt-8">No messages yet.</div>
                )}

                {chat.map((msg, i) => (
                    <div
                        key={i}
                        className={`mb-4 flex items-start group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'ai' && (
                            <FaRobot className="text-blue-500 mr-2 mt-1" aria-label="AI" />
                        )}

                        <div className={`relative max-w-[80%] px-4 py-3 rounded-lg shadow-sm border ${msg.role === 'user' ? 'bg-blue-500 text-white text-right' : 'bg-white text-gray-800 text-left border-gray-200'
                            }`}>
                            <span className="text-sm">{msg.content}</span>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                {msg.role === 'ai' && (
                                    <>
                                        <button className="text-gray-400 hover:text-blue-500 text-xs">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                        <button className="text-gray-400 hover:text-blue-500 text-xs">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => onDeleteMessage(i)}
                                    title="Delete message"
                                    aria-label="Delete message"
                                    className="text-gray-400 hover:text-red-500 text-xs"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            <FaUser className="text-gray-500 ml-2 mt-1" aria-label="User" />
                        )}
                    </div>
                ))}

                <div ref={chatEndRef} />
            </div>

            <form onSubmit={onSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Prompt"
                    disabled={sending || aiLoading}
                />
                <button
                    type="submit"
                    className="bg-white text-gray-700 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={sending || aiLoading}
                >
                    {sending || aiLoading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
} 