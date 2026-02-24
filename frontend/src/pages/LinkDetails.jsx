import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';
import { linksAPI, analyticsAPI } from '../services/api';
import {
    ArrowLeft, Link2, ExternalLink, Copy, CheckCircle,
    Loader, BarChart3, Globe, Monitor, Share2,
    Sun, Moon, MousePointerClick
} from 'lucide-react';
import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const COLORS = ['#DC2626', '#0A0A0A', '#6B6B6B', '#A0A0A0', '#D0D0CB', '#E5E5E0'];

export default function LinkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const [copySuccess, setCopySuccess] = useState(false);

    const { data: link, isLoading: linkLoading } = useQuery({
        queryKey: ['link', id],
        queryFn: async () => (await linksAPI.getById(id)).data.data,
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['analytics', id],
        queryFn: async () => (await analyticsAPI.getSummary(id)).data.data,
        enabled: !!link,
    });

    const handleCopy = async (t) => { try { await navigator.clipboard.writeText(t); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); } catch (e) { console.error(e); } };

    const clicksData = analytics?.recentClicks?.map(i => ({ date: new Date(i.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), clicks: i.count })) || [];
    const deviceData = analytics?.byDevice?.map(i => ({ name: i.name.charAt(0).toUpperCase() + i.name.slice(1), value: i.count })) || [];
    const countryData = analytics?.byCountry?.slice(0, 5).map(i => ({ name: i.name, clicks: i.count })) || [];
    const referrerData = analytics?.byReferrer?.slice(0, 5).map(i => ({ name: i.name || 'Direct', clicks: i.count })) || [];

    const tooltipStyle = {
        backgroundColor: isDark ? '#161616' : '#FFFFFF',
        border: `1px solid ${isDark ? '#2A2A2A' : '#E5E5E0'}`,
        borderRadius: '8px',
        fontSize: '12px',
        color: isDark ? '#E8E8E8' : '#0A0A0A',
    };
    const gridColor = isDark ? '#2A2A2A' : '#E5E5E0';
    const tickFill = isDark ? '#707070' : '#A0A0A0';

    if (linkLoading) return <div className="min-h-screen bg-pg dark:bg-dk flex items-center justify-center"><Loader className="w-6 h-6 text-ink-muted dark:text-dk-muted animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-pg dark:bg-dk transition-colors">
            <header className="sticky top-0 z-30 bg-pg/80 dark:bg-dk/80 backdrop-blur-md border-b border-ln dark:border-dk-ln transition-colors">
                <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-ink-secondary dark:text-dk-secondary hover:text-ink dark:hover:text-dk-text transition-colors">
                        <ArrowLeft className="w-4 h-4" />Back
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-lg text-ink-secondary dark:text-dk-secondary hover:bg-pg-elevated dark:hover:bg-dk-elevated transition-colors">
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            <div className="max-w-container mx-auto px-6 py-8">
                {/* Link Info */}
                <div className="card !p-6 mb-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="font-display text-h4 italic text-ink dark:text-dk-text truncate">{link?.title || 'Untitled Link'}</h1>
                            <p className="text-sm text-ink-muted dark:text-dk-muted truncate mt-1">{link?.originalUrl}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <code className="px-2 py-0.5 bg-pg-elevated dark:bg-dk-elevated border border-ln dark:border-dk-ln rounded text-sm font-mono text-ink dark:text-dk-text">{link?.shortUrl}</code>
                                <button onClick={() => handleCopy(link?.shortUrl)} className="p-1 hover:bg-pg-elevated dark:hover:bg-dk-elevated rounded transition-colors">
                                    {copySuccess ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-ink-muted dark:text-dk-muted" />}
                                </button>
                            </div>
                        </div>
                        <a href={link?.shortUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm self-start"><ExternalLink className="w-3.5 h-3.5" />Visit</a>
                    </div>
                </div>

                {analyticsLoading ? (
                    <div className="flex items-center justify-center py-20"><Loader className="w-5 h-5 text-ink-muted dark:text-dk-muted animate-spin" /></div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                            {[
                                { icon: MousePointerClick, value: analytics?.totalClicks || 0, label: 'Total Clicks', accent: true },
                                { icon: Globe, value: analytics?.byCountry?.length || 0, label: 'Countries' },
                                { icon: Monitor, value: analytics?.byDevice?.length || 0, label: 'Devices' },
                                { icon: Share2, value: analytics?.byReferrer?.length || 0, label: 'Referrers' },
                            ].map(s => (
                                <div key={s.label} className="card">
                                    <s.icon className={`w-4 h-4 mb-2 ${s.accent ? 'text-accent' : 'text-ink-muted dark:text-dk-muted'}`} />
                                    <p className="font-display text-2xl italic text-ink dark:text-dk-text">{s.value}</p>
                                    <p className="mt-0.5 text-xs text-ink-muted dark:text-dk-muted uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid lg:grid-cols-2 gap-4">
                            {/* Clicks Over Time */}
                            <div className="card !p-5 lg:col-span-2">
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text font-sans uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5 text-accent" />Clicks Over Time
                                </h3>
                                {clicksData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={clicksData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                            <XAxis dataKey="date" tick={{ fill: tickFill, fontSize: 11 }} stroke={gridColor} />
                                            <YAxis tick={{ fill: tickFill, fontSize: 11 }} stroke={gridColor} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Line type="monotone" dataKey="clicks" stroke="#DC2626" strokeWidth={2} dot={{ fill: '#DC2626', r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 0, fill: '#B91C1C' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : <div className="h-[260px] flex items-center justify-center text-xs text-ink-muted dark:text-dk-muted">No click data</div>}
                            </div>

                            {/* Devices */}
                            <div className="card !p-5">
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text font-sans uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <Monitor className="w-3.5 h-3.5 text-ink-muted dark:text-dk-muted" />Devices
                                </h3>
                                {deviceData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                                    {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                            {deviceData.map((d, i) => (
                                                <span key={d.name} className="flex items-center gap-1.5 text-xs">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                    <span className="text-ink-muted dark:text-dk-muted">{d.name}</span>
                                                    <span className="text-ink dark:text-dk-text font-medium">{d.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : <div className="h-[200px] flex items-center justify-center text-xs text-ink-muted dark:text-dk-muted">No device data</div>}
                            </div>

                            {/* Countries */}
                            <div className="card !p-5">
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text font-sans uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-ink-muted dark:text-dk-muted" />Top Countries
                                </h3>
                                {countryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={countryData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                                            <XAxis type="number" tick={{ fill: tickFill, fontSize: 11 }} stroke={gridColor} />
                                            <YAxis type="category" dataKey="name" tick={{ fill: tickFill, fontSize: 11 }} stroke={gridColor} width={60} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Bar dataKey="clicks" fill="#DC2626" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <div className="h-[200px] flex items-center justify-center text-xs text-ink-muted dark:text-dk-muted">No country data</div>}
                            </div>

                            {/* Referrers */}
                            <div className="card !p-5 lg:col-span-2">
                                <h3 className="text-sm font-semibold text-ink dark:text-dk-text font-sans uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <Share2 className="w-3.5 h-3.5 text-ink-muted dark:text-dk-muted" />Top Referrers
                                </h3>
                                {referrerData.length > 0 ? (
                                    <div className="space-y-3">
                                        {referrerData.map((r, i) => {
                                            const max = Math.max(...referrerData.map(x => x.clicks));
                                            const pct = max > 0 ? (r.clicks / max) * 100 : 0;
                                            return (
                                                <div key={i}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-ink dark:text-dk-text truncate mr-4">{r.name}</span>
                                                        <span className="text-sm text-ink-muted dark:text-dk-muted flex-shrink-0">{r.clicks}</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-pg-elevated dark:bg-dk-elevated rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <div className="h-[140px] flex items-center justify-center text-xs text-ink-muted dark:text-dk-muted">No referrer data</div>}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}