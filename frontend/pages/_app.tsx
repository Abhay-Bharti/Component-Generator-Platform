import '../src/app/globals.css';
import type { AppProps } from 'next/app';
import Nav from '../components/Nav';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Nav />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp; 