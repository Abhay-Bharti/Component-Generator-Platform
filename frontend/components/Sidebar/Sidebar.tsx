import { FaUserCircle, FaSignOutAlt, FaHome, FaSearch, FaComments, FaThLarge, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import React from 'react';

interface Session {
    _id: string;
    title: string;
    updatedAt: string;
}

interface SidebarProps {
    user: { email: string } | null;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    search: string;
    setSearch: (s: string) => void;
    sessions: Session[];
    onSessionClick: (id: string) => void;
    onLogout: () => void;
    onNewChat: () => void;
}

export default function Sidebar({ user, sidebarOpen, setSidebarOpen, search, setSearch, sessions, onSessionClick, onLogout, onNewChat }: SidebarProps) {
    return (
        <aside className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'} bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col justify-between py-4 px-3 shadow-lg`}>
            <div>
                {/* Expand/collapse button */}
                <button
                    className="absolute top-4 right-[-16px] bg-gray-900 text-white rounded-full p-1 shadow hover:bg-gray-800 z-10"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    style={{ left: sidebarOpen ? '320px' : '60px' }}
                >
                    {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
                {/* User info and logout in one line */}
                <div className={`flex items-center gap-2 mb-6 pl-2 ${sidebarOpen ? '' : 'justify-center'}`}>
                    <FaUserCircle className="text-2xl text-blue-300" />
                    {sidebarOpen && user && <span className="text-sm text-blue-100 truncate max-w-[120px]">{user.email}</span>}
                    <button onClick={onLogout} className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs ml-auto"><FaSignOutAlt />{sidebarOpen && 'Logout'}</button>
                </div>
                {/* Always-visible nav */}
                <nav className={`flex flex-col gap-1 mb-4 ${sidebarOpen ? '' : 'items-center'}`}>
                    <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition w-full" onClick={() => window.location.pathname = '/'}> <FaHome /> {sidebarOpen && 'Home'} </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition w-full" onClick={() => window.location.pathname = '/dashboard'}> <FaThLarge /> {sidebarOpen && 'Dashboard'} </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition w-full" onClick={onNewChat}> <FaComments /> {sidebarOpen && 'New Chat'} </button>
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
                        {sessions.map(session => (
                            <li key={session._id}>
                                <button
                                    className="w-full text-left px-3 py-2 rounded hover:bg-blue-900/60 transition flex items-center gap-2"
                                    onClick={() => onSessionClick(session._id)}
                                >
                                    <span className="truncate">{session.title}</span>
                                </button>
                            </li>
                        ))}
                        {sessions.length === 0 && <li className="text-gray-400 text-center mt-8">No sessions found.</li>}
                    </ul>
                </div>
            </div>
        </aside>
    );
} 