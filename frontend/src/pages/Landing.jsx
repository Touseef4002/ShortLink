import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Link2, BarChart3, Shield, Zap, Moon, Sun } from 'lucide-react';
import DotGrid from '../components/DotGrid';

export default function Landing() {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
            {/* Hero Section with DotGrid Background */}
            <div className="relative overflow-hidden bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
                {/* Animated Dot Grid Background */}
                <DotGrid
                    dotSize={2.5}
                    gap={30}
                    baseColor={isDark ? '#3f3f46' : '#d1d5db'}
                    activeColor="#9333ea"
                    proximity={120}
                    shockRadius={200}
                    shockStrength={3}
                />

                {/* Navbar */}
                <nav className="relative container mx-auto px-4 py-6 border-b border-gray-200 dark:border-zinc-800 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-primary-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">ShortLink</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            <Link
                                to="/login"
                                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative container mx-auto px-4 py-20 md:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in text-gray-900 dark:text-white transition-colors duration-200">
                            Shorten Your Links
                            <br />
                            <span className="text-primary-500">Track Every Click</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 animate-slide-up transition-colors duration-200">
                            Create beautiful short links with powerful analytics.
                            Know who clicks, when, and from where.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Start for Free
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-4 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl font-semibold text-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative container mx-auto px-4 py-20">
                {/* Dot Grid Background for Features */}
                <div className="absolute inset-0 -mx-4">
                    <DotGrid
                        dotSize={2}
                        gap={30}
                        baseColor={isDark ? '#3f3f46' : '#d1d5db'}
                        activeColor="#9333ea"
                        proximity={100}
                        shockRadius={150}
                        shockStrength={2}
                    />
                </div>

                <h2 className="relative text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-colors duration-200">
                    Why Choose <span className="text-primary-500">ShortLink</span>?
                </h2>

                <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-primary-600 dark:hover:border-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Link2 className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Custom Links</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create branded short links with custom aliases for better recognition.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-primary-600 dark:hover:border-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Detailed Analytics</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track clicks, locations, devices, and referrers in real-time.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-primary-600 dark:hover:border-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Secure & Private</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your data is encrypted and secure. We respect your privacy.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 hover:border-primary-600 dark:hover:border-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Lightning Fast</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Blazing fast redirects with 99.9% uptime guarantee.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-100 dark:bg-zinc-800 border-y border-gray-200 dark:border-zinc-700 py-20 transition-colors duration-200">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-200">
                        Join thousands of users who trust ShortLink
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Create Your First Link
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 py-12 transition-colors duration-200">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Link2 className="w-6 h-6 text-primary-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">ShortLink</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        © 2024 ShortLink. Built with ❤️ using MERN Stack.
                    </p>
                </div>
            </footer>
        </div>
    );
}