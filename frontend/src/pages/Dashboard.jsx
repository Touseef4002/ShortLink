import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { linksAPI, analyticsAPI } from '../services/api';
import {
    Link2, Plus, Copy, ExternalLink, Trash2, BarChart3,
    LogOut, User, AlertCircle, CheckCircle, Loader, QrCode, Download, X,
    TrendingUp, MousePointerClick, Award, Calendar, Search, Filter, SortAsc, SortDesc,
    CheckSquare, Square, FileDown, Sun, Moon, AlertTriangle, Clock
} from 'lucide-react';
import QRCodeCanvas from 'qrcode';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const qrCanvasRef = useRef(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    const [formData, setFormData] = useState({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedLinks, setSelectedLinks] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(null);
    const [formError, setFormError] = useState('');

    const getExpirationStatus = (expiresAt) => {
        if (!expiresAt) return null;
        const now = new Date();
        const exp = new Date(expiresAt);
        const days = Math.ceil((exp - now) / 86400000);
        if (days < 0) return { status: 'expired', message: 'Expired', color: 'red', icon: AlertTriangle };
        if (days === 0) return { status: 'today', message: 'Expires Today', color: 'red', icon: AlertTriangle };
        if (days === 1) return { status: 'tomorrow', message: 'Expires Tomorrow', color: 'orange', icon: Clock };
        if (days <= 7) return { status: 'soon', message: `Expires in ${days}d`, color: 'orange', icon: Clock };
        if (days <= 30) return { status: 'normal', message: `Expires in ${days}d`, color: 'blue', icon: Clock };
        return { status: 'safe', message: `Expires in ${days}d`, color: 'green', icon: CheckCircle };
    };

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => (await analyticsAPI.getDashboardStats()).data.data,
    });

    const { data: links, isLoading } = useQuery({
        queryKey: ['links'],
        queryFn: async () => (await linksAPI.getAll()).data.data,
    });

    const filteredLinks = useMemo(() => {
        if (!links) return [];
        let f = [...links];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            f = f.filter(l => (l.title || '').toLowerCase().includes(q) || l.originalUrl.toLowerCase().includes(q) || l.shortCode.toLowerCase().includes(q));
        }
        if (filterBy === 'most-clicked') { f = f.filter(l => l.clicks > 0).sort((a, b) => b.clicks - a.clicks); }
        else if (filterBy === 'recent') { const d = new Date(); d.setDate(d.getDate() - 7); f = f.filter(l => new Date(l.createdAt) >= d); }
        if (filterBy === 'all') { f.sort((a, b) => sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)); }
        return f;
    }, [links, searchQuery, filterBy, sortOrder]);

    const createMutation = useMutation({
        mutationFn: (d) => linksAPI.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['links'] }); queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }); setFormData({ originalUrl: '', customAlias: '', title: '', expiresAt: '' }); setShowCreateForm(false); setFormError(''); },
        onError: (e) => setFormError(e.response?.data?.message || 'Failed to create link'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => linksAPI.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['links'] }); queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }); },
    });

    const handleCreate = (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.originalUrl) { setFormError('Please provide the original URL'); return; }
        createMutation.mutate({ originalUrl: formData.originalUrl, customAlias: formData.customAlias || undefined, title: formData.title || undefined, expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined });
    };

    const handleCopy = async (url, id) => { try { await navigator.clipboard.writeText(url); setCopySuccess(id); setTimeout(() => setCopySuccess(null), 2000); } catch (e) { console.error(e); } };

    const toggleSelect = (id) => setSelectedLinks(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
    const toggleAll = () => { if (!filteredLinks.length) return; setSelectedLinks(selectedLinks.length === filteredLinks.length ? [] : filteredLinks.map(l => l._id)); };

    const handleBulkDelete = async () => {
        if (!selectedLinks.length || !confirm(`Delete ${selectedLinks.length} link(s)?`)) return;
        setBulkDeleteLoading(true);
        try { await Promise.all(selectedLinks.map(id => linksAPI.delete(id))); queryClient.invalidateQueries({ queryKey: ['links'] }); queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }); setSelectedLinks([]); }
        catch { alert('Failed to delete selected links.'); }
        finally { setBulkDeleteLoading(false); }
    };

    const handleExport = () => {
        if (!selectedLinks.length) return;
        const d = links.filter(l => selectedLinks.includes(l._id)).map(l => ({ title: l.title || 'Untitled', originalUrl: l.originalUrl, shortUrl: l.shortUrl, shortCode: l.shortCode, clicks: l.clicks, createdAt: l.createdAt, isActive: l.isActive }));
        const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `shortlink-export-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(a.href);
    };

    const handleShowQR = async (link) => {
        setSelectedLink(link); setShowQRModal(true);
        setTimeout(async () => { if (qrCanvasRef.current) await QRCodeCanvas.toCanvas(qrCanvasRef.current, link.shortUrl, { width: 280, margin: 2, color: { dark: '#0A0A0A', light: '#ffffff' } }); }, 100);
    };

    const handleDownloadQR = () => { if (!qrCanvasRef.current) return; const a = document.createElement('a'); a.download = `qr-${selectedLink.shortCode}.png`; a.href = qrCanvasRef.current.toDataURL('image/png'); a.click(); };

    const badgeColors = {
        red: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
        orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
        blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        green: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
    };

    return (
        <div className="min-h-screen bg-pg dark:bg-dk transition-colors">
            {/* Navbar */}
            <nav className="sticky top-0 z-30 bg-pg/80 dark:bg-dk/80 backdrop-blur-md border-b border-ln dark:border-dk-ln transition-colors">
                <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-ink dark:bg-dk-text rounded-lg flex items-center justify-center">
                            <Link2 className="w-3.5 h-3.5 text-ink-inverse dark:text-dk" />
                        </div>
                        <span className="text-lg font-display italic text-ink dark:text-dk-text">ShortLink</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-lg text-ink-secondary dark:text-dk-secondary hover:bg-pg-elevated dark:hover:bg-dk-elevated transition-colors">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <div className="hidden sm:flex items-center gap-1.5 text-sm text-ink-secondary dark:text-dk-secondary">
                            <div className="w-6 h-6 bg-pg-elevated dark:bg-dk-elevated rounded-full flex items-center justify-center"><User className="w-3 h-3" /></div>
                            {user?.name}
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary !py-1.5 !px-3 text-xs">
                            <LogOut className="w-3 h-3" /><span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-h3 italic text-ink dark:text-dk-text">Your Links</h1>
                        <p className="text-sm text-ink-secondary dark:text-dk-secondary mt-0.5">Manage and track your short links</p>
                    </div>
                    {!showCreateForm && (
                        <button onClick={() => setShowCreateForm(true)} className="btn-primary text-sm self-start sm:self-auto">
                            <Plus className="w-4 h-4" />New Link
                        </button>
                    )}
                </div>

                {/* Stats */}
                {statsLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="card animate-pulse"><div className="h-12 bg-pg-elevated dark:bg-dk-elevated rounded" /></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                        {[
                            { icon: Link2, value: stats?.totalLinks || 0, label: 'Total Links' },
                            { icon: MousePointerClick, value: stats?.totalClicks || 0, label: 'Total Clicks' },
                            { icon: Award, value: stats?.mostPopularLink ? stats.mostPopularLink.clicks : '—', label: stats?.mostPopularLink?.title || 'Most Popular' },
                            { icon: TrendingUp, value: stats?.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0, label: 'Avg. per Link' },
                        ].map(s => (
                            <div key={s.label} className="card card-hover">
                                <s.icon className="w-4 h-4 text-ink-muted dark:text-dk-muted mb-2" />
                                <p className="font-display text-2xl italic text-ink dark:text-dk-text">{s.value}</p>
                                <p className="mt-0.5 text-xs text-ink-muted dark:text-dk-muted uppercase tracking-wider truncate">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="card !p-6 mb-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-ink dark:text-dk-text font-sans uppercase tracking-wider">Create Short Link</h2>
                            <button onClick={() => { setShowCreateForm(false); setFormError(''); }} className="p-1 rounded text-ink-muted dark:text-dk-muted hover:text-ink dark:hover:text-dk-text transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && (
                            <div className="mb-4 p-3 bg-accent-light dark:bg-accent/10 border border-accent/20 rounded-btn flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /><p className="text-sm text-accent dark:text-red-400">{formError}</p>
                            </div>
                        )}
                        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1">Original URL *</label>
                                <input type="url" value={formData.originalUrl} onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })} placeholder="https://example.com/very-long-url" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1">Custom Alias</label>
                                <input type="text" value={formData.customAlias} onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })} placeholder="my-link" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1">Title</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="My Link" className="input-field" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-ink dark:text-dk-text mb-1">Expiration</label>
                                <input type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} min={new Date().toISOString().slice(0, 16)} className="input-field" />
                            </div>
                            <div className="sm:col-span-2 flex gap-2 pt-1">
                                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {createMutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" />Creating…</span> : 'Create Link'}
                                </button>
                                <button type="button" onClick={() => { setShowCreateForm(false); setFormError(''); }} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Bulk Bar */}
                {selectedLinks.length > 0 && (
                    <div className="mb-4 bg-ink dark:bg-dk-text text-ink-inverse dark:text-dk rounded-btn px-4 py-2.5 flex items-center justify-between animate-fade-in text-sm">
                        <span className="font-medium flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5" />{selectedLinks.length} selected</span>
                        <div className="flex gap-1.5">
                            <button onClick={handleExport} className="px-3 py-1 rounded bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 transition-colors text-xs flex items-center gap-1"><FileDown className="w-3 h-3" />Export</button>
                            <button onClick={handleBulkDelete} disabled={bulkDeleteLoading} className="px-3 py-1 rounded bg-accent hover:bg-accent-hover text-white transition-colors text-xs flex items-center gap-1 disabled:opacity-50">
                                {bulkDeleteLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}Delete
                            </button>
                            <button onClick={() => setSelectedLinks([])} className="px-2 py-1 rounded bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 transition-colors"><X className="w-3 h-3" /></button>
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="mb-4 space-y-2.5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-dk-muted" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, URL or code…" className="input-field !pl-10" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-dk-muted hover:text-ink dark:hover:text-dk-text transition-colors"><X className="w-4 h-4" /></button>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-ink-muted dark:text-dk-muted mr-0.5" />
                        {['all', 'most-clicked', 'recent'].map(f => (
                            <button key={f} onClick={() => setFilterBy(f)} className={`pill ${filterBy === f ? 'pill-active' : ''}`}>
                                {f === 'all' ? 'All' : f === 'most-clicked' ? 'Most Clicked' : 'Recent'}
                            </button>
                        ))}
                        {filterBy === 'all' && (
                            <>
                                <span className="w-px h-4 bg-ln dark:bg-dk-ln mx-1" />
                                <button onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} className="pill">
                                    {sortOrder === 'desc' ? <><SortDesc className="w-3 h-3" />Newest</> : <><SortAsc className="w-3 h-3" />Oldest</>}
                                </button>
                            </>
                        )}
                    </div>
                    {searchQuery && <p className="text-xs text-ink-muted dark:text-dk-muted">{filteredLinks.length} result{filteredLinks.length !== 1 ? 's' : ''}</p>}
                </div>

                {/* Select All */}
                {filteredLinks.length > 0 && (
                    <button onClick={toggleAll} className="mb-3 flex items-center gap-1.5 text-xs text-ink-secondary dark:text-dk-secondary hover:text-ink dark:hover:text-dk-text transition-colors">
                        {selectedLinks.length === filteredLinks.length && filteredLinks.length > 0 ? <CheckSquare className="w-3.5 h-3.5 text-accent" /> : <Square className="w-3.5 h-3.5" />}
                        {selectedLinks.length === filteredLinks.length && filteredLinks.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                )}

                {/* Links */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20"><Loader className="w-5 h-5 text-ink-muted dark:text-dk-muted animate-spin" /></div>
                ) : filteredLinks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 bg-pg-elevated dark:bg-dk-elevated rounded-full flex items-center justify-center mx-auto mb-3"><Link2 className="w-6 h-6 text-ink-muted dark:text-dk-muted" /></div>
                        <h3 className="font-display text-lg italic text-ink dark:text-dk-text mb-1">{searchQuery || filterBy !== 'all' ? 'No links found' : 'No links yet'}</h3>
                        <p className="text-sm text-ink-secondary dark:text-dk-secondary mb-4">{searchQuery || filterBy !== 'all' ? 'Try adjusting your search or filters' : 'Create your first short link'}</p>
                        {(searchQuery || filterBy !== 'all') && <button onClick={() => { setSearchQuery(''); setFilterBy('all'); }} className="btn-secondary text-xs">Clear Filters</button>}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredLinks.map(link => {
                            const exp = link.expiresAt ? getExpirationStatus(link.expiresAt) : null;
                            const isExpired = exp?.status === 'expired';
                            return (
                                <div key={link._id} className={`card card-hover transition-all ${isExpired ? 'opacity-50' : ''} ${selectedLinks.includes(link._id) ? '!border-ln-strong dark:!border-dk-ln-hover' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <button onClick={() => toggleSelect(link._id)} className="mt-0.5 flex-shrink-0">
                                            {selectedLinks.includes(link._id) ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4 text-ink-muted dark:text-dk-muted" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-ink dark:text-dk-text truncate font-sans">{link.title || 'Untitled Link'}</h3>
                                            <p className="text-sm text-ink-muted dark:text-dk-muted truncate mt-0.5">{link.originalUrl}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <code className="px-2 py-0.5 bg-pg-elevated dark:bg-dk-elevated border border-ln dark:border-dk-ln rounded text-xs font-mono text-ink dark:text-dk-text truncate">{link.shortUrl}</code>
                                                <button onClick={() => handleCopy(link.shortUrl, link._id)} className="p-1 hover:bg-pg-elevated dark:hover:bg-dk-elevated rounded transition-colors" title="Copy">
                                                    {copySuccess === link._id ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-ink-muted dark:text-dk-muted" />}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-ink-muted dark:text-dk-muted">
                                                <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{link.clicks}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(link.createdAt).toLocaleDateString()}</span>
                                                {exp && (() => {
                                                    const Icon = exp.icon;
                                                    return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${badgeColors[exp.color] || badgeColors.blue}`}><Icon className="w-3 h-3" />{exp.message}</span>;
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                                            <button onClick={() => handleShowQR(link)} className="btn-primary !py-1.5 !px-2.5 text-xs" title="QR"><QrCode className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => navigate(`/links/${link._id}`)} className="btn-secondary !py-1.5 !px-2.5 text-xs" title="Stats"><BarChart3 className="w-3.5 h-3.5" /></button>
                                            {isExpired ? (
                                                <button disabled className="btn-secondary !py-1.5 !px-2.5 text-xs opacity-40 cursor-not-allowed"><ExternalLink className="w-3.5 h-3.5" /></button>
                                            ) : (
                                                <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5 !px-2.5 text-xs" title="Visit"><ExternalLink className="w-3.5 h-3.5" /></a>
                                            )}
                                            <button onClick={() => { if (confirm('Delete this link?')) deleteMutation.mutate(link._id); }} className="btn-danger !py-1.5 !px-2.5 text-xs" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {showQRModal && selectedLink && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowQRModal(false)}>
                    <div className="card !p-6 max-w-sm w-full shadow-overlay animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-ink dark:text-dk-text font-sans uppercase tracking-wider">QR Code</h3>
                            <button onClick={() => setShowQRModal(false)} className="p-1 rounded text-ink-muted dark:text-dk-muted hover:text-ink dark:hover:text-dk-text transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-ink-secondary dark:text-dk-secondary text-center mb-1">{selectedLink.title || 'Untitled'}</p>
                        <code className="block text-sm text-ink-muted dark:text-dk-muted text-center font-mono mb-4 truncate">{selectedLink.shortUrl}</code>
                        <div className="flex justify-center mb-4 bg-white p-4 rounded-card border border-ln">
                            <canvas ref={qrCanvasRef} className="max-w-full h-auto" />
                        </div>
                        <button onClick={handleDownloadQR} className="w-full btn-primary text-sm"><Download className="w-4 h-4" />Download PNG</button>
                    </div>
                </div>
            )}
        </div>
    );
}