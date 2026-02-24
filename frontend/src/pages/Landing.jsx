import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Link2, BarChart3, Shield, Zap, Moon, Sun, ArrowRight, MousePointerClick, Globe } from 'lucide-react';

export default function Landing() {
    const { toggleTheme, isDark } = useTheme();

    return (
        <div className="min-h-screen bg-pg dark:bg-dk transition-colors duration-200">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-30 bg-pg/80 dark:bg-dk/80 backdrop-blur-md border-b border-ln dark:border-dk-ln transition-colors">
                <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-ink dark:bg-dk-text rounded-lg flex items-center justify-center">
                            <Link2 className="w-4 h-4 text-ink-inverse dark:text-dk" />
                        </div>
                        <span className="text-lg font-display italic text-ink dark:text-dk-text">ShortLink</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-lg text-ink-secondary dark:text-dk-secondary hover:bg-pg-elevated dark:hover:bg-dk-elevated transition-colors" title={isDark ? 'Light mode' : 'Dark mode'}>
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <Link to="/login" className="px-4 py-2 text-sm text-ink-secondary dark:text-dk-secondary hover:text-ink dark:hover:text-dk-text font-medium transition-colors">Log In</Link>
                        <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]" style={{
                    backgroundImage: 'radial-gradient(circle, #C0C0BB 1px, transparent 1px)',
                    backgroundSize: '28px 28px'
                }} />
                <div className="relative max-w-container mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-28">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="font-display text-display text-ink dark:text-dk-text animate-fade-in">
                            <span className="italic">Shorten.</span>{' '}
                            <span className="italic">Track.</span>
                            <br />
                            <span className="not-italic">Optimize.</span>
                        </h1>
                        <p className="mt-6 text-lg text-ink-secondary dark:text-dk-secondary max-w-md mx-auto leading-relaxed animate-slide-up">
                            ShortLink brings powerful analytics to every link you share. Know who clicks, when, and from where.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-scale-in">
                            <Link to="/register" className="btn-primary !px-6 !py-3 text-base">
                                <span className="w-5 h-5 bg-accent rounded flex items-center justify-center flex-shrink-0">
                                    <ArrowRight className="w-3 h-3 text-white" />
                                </span>
                                Get Started Free
                            </Link>
                            <Link to="/login" className="btn-secondary !px-6 !py-3 text-base">Sign In</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Strip ── */}
            <section className="border-y border-ln dark:border-dk-ln bg-pg-card dark:bg-dk-card transition-colors">
                <div className="max-w-container mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: '10K+', label: 'Links Created' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '<50ms', label: 'Avg. Redirect' },
                        { value: '100%', label: 'Free Forever' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="font-display text-3xl italic text-ink dark:text-dk-text">{s.value}</p>
                            <p className="mt-1 text-xs uppercase tracking-widest text-ink-muted dark:text-dk-muted">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="bg-pg dark:bg-dk transition-colors">
                <div className="max-w-container mx-auto px-6 py-24">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-h2 italic text-ink dark:text-dk-text">Everything you need</h2>
                        <p className="mt-3 text-base text-ink-secondary dark:text-dk-secondary max-w-md mx-auto">
                            Powerful features to manage, track, and optimize every link.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Link2, title: 'Custom Links', desc: 'Create branded short links with custom aliases for better recognition.' },
                            { icon: BarChart3, title: 'Detailed Analytics', desc: 'Track clicks, locations, devices, and referrers in real-time.' },
                            { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and secure. We respect your privacy.' },
                            { icon: Zap, title: 'Lightning Fast', desc: 'Blazing fast redirects with 99.9% uptime guaranteed.' },
                        ].map(f => (
                            <div key={f.title} className="card card-hover group">
                                <div className="w-9 h-9 bg-ink dark:bg-dk-text rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                    <f.icon className="w-4 h-4 text-ink-inverse dark:text-dk" />
                                </div>
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text font-sans mb-1">{f.title}</h3>
                                <p className="text-sm text-ink-secondary dark:text-dk-secondary leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Product Highlight ── */}
            <section className="border-y border-ln dark:border-dk-ln bg-pg-card dark:bg-dk-card transition-colors">
                <div className="max-w-container mx-auto px-6 py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-display text-h1 text-ink dark:text-dk-text">
                                <span className="italic">Track every click</span>{' '}
                                down to the device
                            </h2>
                            <p className="mt-5 text-base text-ink-secondary dark:text-dk-secondary leading-relaxed max-w-md">
                                Get detailed breakdowns by country, device, browser, and referrer. See when your links are most active and optimize your sharing strategy.
                            </p>
                            <Link to="/register" className="btn-primary mt-8">
                                <span className="w-5 h-5 bg-accent rounded flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-3 h-3 text-white" />
                                </span>
                                Start Tracking
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: MousePointerClick, label: 'Click Tracking', value: 'Real-time' },
                                { icon: Globe, label: 'Geo Analytics', value: '195 countries' },
                                { icon: BarChart3, label: 'Referrer Data', value: 'All sources' },
                                { icon: Shield, label: 'QR Codes', value: 'Instant gen' },
                            ].map(c => (
                                <div key={c.label} className="card text-center">
                                    <c.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                                    <p className="font-display text-lg italic text-ink dark:text-dk-text">{c.value}</p>
                                    <p className="mt-0.5 text-xs text-ink-muted dark:text-dk-muted uppercase tracking-wider">{c.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="bg-pg dark:bg-dk py-24 transition-colors">
                <div className="max-w-container mx-auto px-6 text-center">
                    <h2 className="font-display text-h2 italic text-ink dark:text-dk-text">Ready to get started?</h2>
                    <p className="mt-3 text-base text-ink-secondary dark:text-dk-secondary max-w-md mx-auto">
                        Join thousands of users who trust ShortLink to manage their links.
                    </p>
                    <Link to="/register" className="btn-primary !px-6 !py-3 text-base mt-8">
                        <span className="w-5 h-5 bg-accent rounded flex items-center justify-center flex-shrink-0">
                            <ArrowRight className="w-3 h-3 text-white" />
                        </span>
                        Create Your First Link
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-ln dark:border-dk-ln py-8 transition-colors">
                <div className="max-w-container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-ink dark:bg-dk-text rounded-md flex items-center justify-center">
                            <Link2 className="w-3 h-3 text-ink-inverse dark:text-dk" />
                        </div>
                        <span className="text-lg font-display italic text-ink dark:text-dk-text">ShortLink</span>
                    </div>
                    <p className="text-xs text-ink-muted dark:text-dk-muted">© 2026 ShortLink. Built with the MERN Stack.</p>
                </div>
            </footer>
        </div>
    );
}