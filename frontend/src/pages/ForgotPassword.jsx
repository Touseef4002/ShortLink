import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Link2, AlertCircle, CheckCircle, Loader, Moon, Sun, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
    const { toggleTheme, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div className="text-center mb-8">
                        <h1 className="font-display text-h3 italic text-ink dark:text-dk-text">Reset password</h1>
                        <p className="mt-2 text-base text-ink-secondary dark:text-dk-secondary">We'll send you a reset link</p>
                    </div>

                    <div className="card !p-6">
                        {success ? (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text mb-1 font-sans">Check your email</h3>
                                <p className="text-sm text-ink-secondary dark:text-dk-secondary mb-5">
                                    Reset link sent to <strong className="text-ink dark:text-dk-text">{email}</strong>
                                </p>
                                <Link to="/login" className="btn-primary text-sm"><ArrowLeft className="w-3.5 h-3.5" />Back to login</Link>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-5 p-3 bg-accent-light dark:bg-accent/10 border border-accent/20 rounded-btn flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-accent dark:text-red-400">{error}</p>
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-dk-muted" />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field !pl-10" required />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full btn-primary !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isLoading ? <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" />Sending…</span> : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    <p className="text-center text-sm text-ink-secondary dark:text-dk-secondary mt-5">
                        <Link to="/login" className="text-ink dark:text-dk-text font-medium hover:underline inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" />Back to login</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}