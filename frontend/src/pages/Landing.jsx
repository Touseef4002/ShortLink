import { Link } from 'react-router-dom';
import { Link2, BarChart3, Shield, Zap } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-zinc-900">
                {/* Navbar */}
                <nav className="container mx-auto px-4 py-6 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-primary-500" />
                            <span className="text-2xl font-bold text-white">ShortLink</span>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="container mx-auto px-4 py-20 md:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in text-white">
                            Shorten Your Links
                            <br />
                            <span className="text-primary-500">Track Every Click</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 animate-slide-up">
                            Create beautiful short links with powerful analytics.
                            Know who clicks, when, and from where.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-200"
                            >
                                Start for Free
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
                    Why Choose <span className="text-primary-500">ShortLink</span>?
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-dark-100 rounded-2xl p-6 border border-dark-200 hover:border-primary-500 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Link2 className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">Custom Links</h3>
                        <p className="text-gray-400">
                            Create branded short links with custom aliases for better recognition.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-dark-100 rounded-2xl p-6 border border-dark-200 hover:border-primary-500 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">Detailed Analytics</h3>
                        <p className="text-gray-400">
                            Track clicks, locations, devices, and referrers in real-time.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-dark-100 rounded-2xl p-6 border border-dark-200 hover:border-primary-500 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">Secure & Private</h3>
                        <p className="text-gray-400">
                            Your data is encrypted and secure. We respect your privacy.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-dark-100 rounded-2xl p-6 border border-dark-200 hover:border-primary-500 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">Lightning Fast</h3>
                        <p className="text-gray-400">
                            Blazing fast redirects with 99.9% uptime guarantee.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-dark-100 border-y border-dark-200 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Join thousands of users who trust ShortLink
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-200"
                    >
                        Create Your First Link
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-dark-50 border-t border-dark-200 py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Link2 className="w-6 h-6 text-primary-500" />
                        <span className="text-xl font-bold text-white">ShortLink</span>
                    </div>
                    <p className="text-gray-400">
                        © 2024 ShortLink. Built with ❤️ using MERN Stack.
                    </p>
                </div>
            </footer>
        </div>
    );
}