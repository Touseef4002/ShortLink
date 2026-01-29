import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Link2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // null, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        // Validation
        if (!formData.password || !formData.confirmPassword) {
            setStatus('error');
            setMessage('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post(`/api/auth/reset-password/${token}`, {
                password: formData.password
            });

            setStatus('success');
            setMessage(response.data.message);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

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
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        Create a new password
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-xl transition-colors duration-200">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Enter your new password below.
                    </p>

                    {/* Success Message */}
                    {status === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl flex items-start gap-3 transition-colors duration-200">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                                    {message}
                                </p>
                                <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                                    Redirecting to login in 3 seconds...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {status === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3 transition-colors duration-200">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 dark:text-red-400 text-sm">{message}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    disabled={loading || status === 'success'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    disabled={loading || status === 'success'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || status === 'success'}
                            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Resetting...
                                </span>
                            ) : status === 'success' ? (
                                'Password Reset Successfully!'
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    {/* Password Requirements */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Password Requirements:
                        </p>
                        <ul className="text-gray-600 dark:text-gray-400 text-xs space-y-1">
                            <li>• At least 6 characters long</li>
                            <li>• Contains letters and numbers (recommended)</li>
                            <li>• Avoid common passwords</li>
                        </ul>
                    </div>
                </div>

                {/* Back to Login */}
                {status !== 'success' && (
                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}