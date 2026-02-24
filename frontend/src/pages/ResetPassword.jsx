import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Link2, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Moon, Sun, Lock } from 'lucide-react';
import { authAPI } from '../services/api';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setIsLoading(true);
        try {
            await authAPI.resetPassword(token, formData.password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
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
                        <h1 className="font-display text-h3 italic text-ink dark:text-dk-text">New password</h1>
                        <p className="mt-2 text-base text-ink-secondary dark:text-dk-secondary">Enter your new password below</p>
                    </div>

                    <div className="card !p-6">
                        {success ? (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text mb-1 font-sans">Password reset!</h3>
                                <p className="text-sm text-ink-secondary dark:text-dk-secondary">Redirecting to login…</p>
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
                                        <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1.5">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-dk-muted" />
                                            <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="input-field !pl-10 !pr-10" required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-dk-muted hover:text-ink dark:hover:text-dk-text transition-colors">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1.5">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-dk-muted" />
                                            <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" className="input-field !pl-10" required />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full btn-primary !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isLoading ? <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" />Resetting…</span> : 'Reset Password'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}