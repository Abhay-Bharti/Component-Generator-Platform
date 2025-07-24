import { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loader from '../components/Loader';
import { FaUserCircle, FaPlus, FaSignOutAlt, FaHome, FaSearch, FaComments, FaThLarge, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
            const res = await axios.post('/api/sessions', { title: sessionTitle, chat: [{ role: 'user', content: 'test' }] }, {
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

    // Filter sessions by search
    const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <Loader />;
    if (error) return <div className="flex flex-col items-center justify-center min-h-screen text-red-600">{error}</div>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'} bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col justify-between py-4 px-3 shadow-lg`}>
                <div>
                    {/* Expand/collapse button */}
                    <button
                        className="absolute top-4 right-[-16px] bg-gray-900 text-white rounded-full p-1 shadow hover:bg-gray-800 z-10"
                        onClick={() => setSidebarOpen(o => !o)}
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        style={{ left: sidebarOpen ? '320px' : '60px' }}
                    >
                        {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                    </button>
                    {/* User info and logout in one line */}
                    <div className={`flex items-center gap-2 mb-6 pl-2 ${sidebarOpen ? '' : 'justify-center'}`}>
                        <FaUserCircle className="text-2xl text-blue-300" />
                        {sidebarOpen && user && <span className="text-sm text-blue-100 truncate max-w-[120px]">{user.email}</span>}
                        <button onClick={handleLogout} className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs ml-auto"><FaSignOutAlt />{sidebarOpen && 'Logout'}</button>
                    </div>
                    {/* Always-visible nav */}
                    <nav className={`flex flex-col gap-1 mb-4 ${sidebarOpen ? '' : 'items-center'}`}>
                        <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition w-full" onClick={() => router.push('/')}> <FaHome /> {sidebarOpen && 'Home'} </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition w-full" onClick={() => router.push('/dashboard')}> <FaThLarge /> {sidebarOpen && 'Dashboard'} </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition w-full" onClick={() => { setSessionTitle(''); setTimeout(() => inputRef.current?.focus(), 100); }}> <FaComments /> {sidebarOpen && 'New Chat'} </button>
                        <div className="relative mt-2 w-full">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={`pl-10 pr-2 py-2 rounded bg-gray-800 text-white border border-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${sidebarOpen ? '' : 'hidden'}`}
                                aria-label="Search sessions"
                            />
                        </div>
                    </nav>
                    {/* Scrollable session list */}
                    <div className={`overflow-y-auto max-h-[50vh] pr-1 mt-2 ${sidebarOpen ? '' : 'hidden'}`}>
                        <ul className="space-y-1">
                            {filteredSessions.map(session => (
                                <li key={session._id}>
                                    <button
                                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-900/60 transition flex items-center gap-2"
                                        onClick={() => handleLoadSession(session._id)}
                                    >
                                        <span className="truncate">{session.title}</span>
                                    </button>
                                </li>
                            ))}
                            {filteredSessions.length === 0 && <li className="text-gray-400 text-center mt-8">No sessions found.</li>}
                        </ul>
                    </div>
                </div>
            </aside>
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