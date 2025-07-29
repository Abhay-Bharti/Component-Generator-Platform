import { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar/Sidebar';
import { FaPlus } from 'react-icons/fa';

interface Session {
    _id: string;
    title: string;
    updatedAt: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionTitle, setSessionTitle] = useState('');
    const [sessionLoading, setSessionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.replace('/login');
            return;
        }
        axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUser(res.data))
            .catch(() => router.replace('/login'));
        axios.get('/api/sessions', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setSessions(res.data))
            .catch(() => setSessions([]))
            .finally(() => setLoading(false));
    }, [router]);

    const handleCreateSession = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!sessionTitle.trim()) return;
        setSessionLoading(true);
        const token = Cookies.get('token');
        try {
            const res = await axios.post('/api/sessions', { title: sessionTitle, chat: [{ role: 'user', content: sessionTitle }] }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions([res.data, ...sessions]);
            setSessionTitle('');
            setTimeout(() => inputRef.current?.focus(), 100);
            router.push(`/session/${res.data._id}`);
        } catch {
            // handle error
        } finally {
            setSessionLoading(false);
        }
    };

    const handleLoadSession = (id: string) => {
        router.push(`/session/${id}`);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/login');
    };

    const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <Loader />;
    if (error) return <div className="flex flex-col items-center justify-center min-h-screen text-red-600">{error}</div>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar
                user={user}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                search={search}
                setSearch={setSearch}
                sessions={filteredSessions}
                onSessionClick={handleLoadSession}
                onLogout={handleLogout}
                onNewChat={() => { setSessionTitle(''); setTimeout(() => inputRef.current?.focus(), 100); }}
            />
            {/* Main Workspace */}
            <main className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl flex flex-col items-center">
                    {/* Welcome message and description */}
                    <div className="w-full text-left mb-8">
                        <div className="text-xl font-semibold text-gray-700 mb-1">Hi{user ? `, ${user.email.split('@')[0]}` : ''} 👋 Welcome to Coder</div>
                        <div className="text-gray-500 text-base">Start creating quick React components, pages, and more with AI-powered generation and editing.</div>
                    </div>
                    {/* Input and New Chat button */}
                    <form onSubmit={handleCreateSession} className="w-full flex items-center gap-2 mb-8">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Start a new chat..."
                            value={sessionTitle}
                            onChange={e => setSessionTitle(e.target.value)}
                            className="flex-1 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                            aria-label="New session name"
                            autoFocus
                        />
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 text-lg hover:bg-blue-700 transition" disabled={sessionLoading || !sessionTitle.trim()}>
                            <FaPlus /> New Chat
                        </button>
                    </form>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Coder!</h1>
                    {user && <p className="mb-6 text-gray-600">Logged in as <span className="font-semibold">{user.email}</span></p>}
                    <p className="text-lg text-gray-500 mb-8 text-center">Select a chat from the sidebar or start a new one to generate and edit React components with AI.</p>
                </div>
            </main>
        </div>
    );
} 