import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import Loader from '../components/Loader';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // If already logged in, redirect to dashboard
        const token = Cookies.get('token');
        if (token) {
            router.replace('/dashboard');
        } else {
            setLoading(false);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await axios.post('/api/auth/register', { email, password });
            setSuccess('Registration successful! Redirecting to login...');
            toast.success('Registration successful!');
            setTimeout(() => router.push('/login'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
            toast.error(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {loading ? <Loader /> : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
                    <h2 className="text-2xl mb-4">Register</h2>
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    {success && <div className="text-green-600 mb-2">{success}</div>}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full mb-2 p-2 border rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full mb-4 p-2 border rounded"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
                </form>
            )}
        </div>
    );
} 