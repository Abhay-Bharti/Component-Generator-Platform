import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatPanel from '../../components/ChatPanel/ChatPanel';
import LivePreviewComponent from '../../components/LivePreview/LivePreview';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import PropertyEditor from '../../components/PropertyEditor/PropertyEditor';
import ChatOverrides from '../../components/ChatOverrides/ChatOverrides';
import Loader from '../../components/Loader';

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
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [showPropertyEditor, setShowPropertyEditor] = useState(false);
    const [showChatOverrides, setShowChatOverrides] = useState(false);
    const [isProcessingOverride, setIsProcessingOverride] = useState(false);

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

    // Handle element selection for property editor
    const handleElementSelect = (element: any) => {
        setSelectedElement(element);
        setShowPropertyEditor(true);
        setShowChatOverrides(false);
    };

    // Handle property changes
    const handlePropertyChange = (elementId: string, property: string, value: string) => {
        // This would update the CSS based on the property change
        // For now, we'll add it to the CSS
        const newCSS = `${code.css}\n/* Property override for ${elementId} */\n#${elementId} { ${property}: ${value}; }`;
        setCode({ ...code, css: newCSS });
    };

    // Handle text changes
    const handleTextChange = (elementId: string, text: string) => {
        // This would update the JSX text content
        // For now, we'll add a comment
        const newJSX = `${code.jsx}\n{/* Text override for ${elementId}: ${text} */}`;
        setCode({ ...code, jsx: newJSX });
    };

    // Handle chat override requests
    const handleOverrideRequest = async (elementId: string, prompt: string) => {
        setIsProcessingOverride(true);
        try {
            const token = Cookies.get('token');
            const overridePrompt = `Modify the element with id "${elementId}" in the following React component. ${prompt}. Only return the updated JSX and CSS code blocks.`;

            const res = await axios.post(`/api/sessions/${id}/chat`, { prompt: overridePrompt }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setChat(res.data.chat);
            setCode(res.data.code || { jsx: '', css: '' });
            setShowChatOverrides(false);
        } catch (err: any) {
            setError('Failed to apply override. Please try again.');
        } finally {
            setIsProcessingOverride(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className="flex flex-col items-center justify-center min-h-screen text-red-600">{error}</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Chat Side Panel */}
            <ChatPanel
                chat={chat}
                input={input}
                setInput={setInput}
                onSend={handleSend}
                onDeleteMessage={handleDeleteMessage}
                onClearChat={handleClearChat}
                sending={sending}
                aiLoading={aiLoading}
                saving={saving}
            />

            {/* Main Preview Area */}
            <div className="flex-1 flex flex-col">
                <LivePreviewComponent jsx={code.jsx} css={code.css} onElementSelect={handleElementSelect} />
                <CodeEditor code={code} setCode={setCode} />
            </div>

            {/* Property Editor */}
            {showPropertyEditor && selectedElement && (
                <PropertyEditor
                    selectedElement={selectedElement}
                    onClose={() => setShowPropertyEditor(false)}
                    onPropertyChange={handlePropertyChange}
                    onTextChange={handleTextChange}
                />
            )}

            {/* Chat-Driven Overrides */}
            {showChatOverrides && selectedElement && (
                <ChatOverrides
                    selectedElement={selectedElement}
                    onClose={() => setShowChatOverrides(false)}
                    onOverrideRequest={handleOverrideRequest}
                    isProcessing={isProcessingOverride}
                />
            )}
        </div>
    );
} 