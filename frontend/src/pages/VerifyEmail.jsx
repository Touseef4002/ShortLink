import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Link2, CheckCircle, XCircle, Loader, Sun, Moon } from 'lucide-react';
import api from '../services/api';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();

    const { toggleTheme, isDark } = useTheme();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await api.get(`/api/auth/verify-email/${token}`);

                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);

                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.data.message);
                }
            }
            catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed.');
            }
        }

        if (token) verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center px-4 transition-colors duration-200">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors shadow-lg"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-2">
                        <Link2 className="w-10 h-10 text-primary-500" />
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">ShortLink</span>
                    </Link>
                </div>

                {/* Verification Card */}
                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-xl text-center transition-colors duration-200">
                    {status === 'verifying' && (
                        <>
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Verifying Your Email
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Please wait while we verify your email address...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Email Verified!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {message}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Redirecting to dashboard in 3 seconds...
                            </p>
                            <Link
                                to="/dashboard"
                                className="inline-block mt-4 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                            >
                                Go to Dashboard Now
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Verification Failed
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="block w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                                >
                                    Go to Login
                                </Link>
                                <Link
                                    to="/resend-verification"
                                    className="block w-full px-6 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                >
                                    Resend Verification Email
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}