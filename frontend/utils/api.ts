import axios from 'axios';

const api = axios.create({
    baseURL: typeof window === 'undefined' ? process.env.BACKEND_URL || 'http://localhost:5000' : '/api',
});

export default api; 