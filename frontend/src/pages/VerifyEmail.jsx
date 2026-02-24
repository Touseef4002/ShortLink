import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Link2, AlertCircle, CheckCircle, Loader, Moon, Sun } from 'lucide-react';
import { authAPI } from '../services/api';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const [status, setStatus] = useState('verifying');
    const [error, setError] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                await authAPI.verifyEmail(token);
                setStatus('success');
                setTimeout(() => navigate('/dashboard'), 3000);
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.message || 'Email verification failed');
            }
        };
        if (token) verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-pg dark:bg-dk flex flex-col transition-colors">
            <header className="flex items-center justify-between px-6 h-16 border-b border-ln dark:border-dk-ln">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-ink dark:bg-dk-text rounded-lg flex items-center justify-center">
                        <Link2 className="w-3.5 h-3.5 text-ink-inverse dark:text-dk" />
                    </div>
                    <span className="text-lg font-display italic text-ink dark:text-dk-text">ShortLink</span>
                </Link>
                <button onClick={toggleTheme} className="p-2 rounded-lg text-ink-secondary dark:text-dk-secondary hover:bg-pg-elevated dark:hover:bg-dk-elevated transition-colors">
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="card !p-8 text-center">
                        {status === 'verifying' && (
                            <>
                                <Loader className="w-8 h-8 text-ink-muted dark:text-dk-muted animate-spin mx-auto mb-4" />
                                <h2 className="font-display text-xl italic text-ink dark:text-dk-text mb-1">Verifying your email</h2>
                                <p className="text-sm text-ink-secondary dark:text-dk-secondary">Please wait…</p>
                            </>
                        )}
                        {status === 'success' && (
                            <>
                                <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="font-display text-xl italic text-ink dark:text-dk-text mb-1">Email verified</h2>
                                <p className="text-sm text-ink-secondary dark:text-dk-secondary mb-5">Redirecting to dashboard…</p>
                                <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard</Link>
                            </>
                        )}
                        {status === 'error' && (
                            <>
                                <div className="w-12 h-12 bg-accent-light dark:bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-6 h-6 text-accent" />
                                </div>
                                <h2 className="font-display text-xl italic text-ink dark:text-dk-text mb-1">Verification failed</h2>
                                <p className="text-sm text-ink-secondary dark:text-dk-secondary mb-5">{error}</p>
                                <Link to="/login" className="btn-primary text-sm">Go to Login</Link>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}