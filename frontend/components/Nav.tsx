import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';

export default function Nav() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // Update token on route change (login/logout)
    useEffect(() => {
        const updateToken = () => setToken(Cookies.get('token') || null);
        updateToken();
        router.events?.on('routeChangeComplete', updateToken);
        return () => {
            router.events?.off('routeChangeComplete', updateToken);
        };
    }, [router]);

    const handleLogout = () => {
        Cookies.remove('token');
        setToken(null);
        router.push('/login');
    };

    return (
        <nav className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow text-white">
            {/* Left: Company Name */}
            <div className="font-bold text-2xl tracking-tight text-blue-400 select-none">Coder</div>
            {/* Center: Nav Tabs */}
            <div className="flex gap-8 text-lg">
                <Link href="/" className="hover:text-blue-400 transition">Home</Link>
                {token && <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>}
            </div>
            {/* Right: Profile Icon or Auth Links */}
            <div className="flex items-center gap-4">
                {!token && <Link href="/login" className="hover:text-blue-400 transition">Login</Link>}
                {!token && <Link href="/register" className="hover:text-blue-400 transition">Register</Link>}
                {token && <button onClick={handleLogout} className="hover:text-red-400 transition">Logout</button>}
                {token && <FaUserCircle className="text-3xl ml-2 text-blue-300 hover:text-blue-500 transition cursor-pointer" title="Profile" />}
            </div>
        </nav>
    );
} 