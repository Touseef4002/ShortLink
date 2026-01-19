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
    CheckSquare, Square, FileDown, Sun, Moon,
    AlertTriangle,
    Clock
} from 'lucide-react';
import QRCodeCanvas from 'qrcode';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const qrCanvasRef = useRef(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    const [formData, setFormData] = useState({
        originalUrl: '',
        customAlias: '',
        title: '',
        expiresAt: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');

    const [selectedLinks, setSelectedLinks] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    const [copySuccess, setCopySuccess] = useState(null);
    const [formError, setFormError] = useState('');

    //Get expiration status
    const getExpirationStatus = (expiresAt) => {
        if (!expiresAt) return null;

        const now = new Date();
        const expiryDate = new Date(expiresAt);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            return {
                status: 'expired',
                message: 'Expired',
                color: 'red',
                icon: AlertTriangle
            };
        } else if (daysUntilExpiry === 0) {
            return {
                status: 'today',
                message: 'Expires Today',
                color: 'red',
                icon: AlertTriangle
            };
        } else if (daysUntilExpiry === 1) {
            return {
                status: 'tomorrow',
                message: 'Expires Tomorrow',
                color: 'orange',
                icon: Clock
            };
        } else if (daysUntilExpiry <= 7) {
            return {
                status: 'soon',
                message: `Expires in ${daysUntilExpiry} days`,
                color: 'yellow',
                icon: Clock
            };
        } else if (daysUntilExpiry <= 30) {
            return {
                status: 'normal',
                message: `Expires in ${daysUntilExpiry} days`,
                color: 'blue',
                icon: Clock
            };
        } else {
            return {
                status: 'safe',
                message: `Expires in ${daysUntilExpiry} days`,
                color: 'green',
                icon: CheckCircle
            }
        }
    };

    // Fetch dashboard stats
    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const response = await analyticsAPI.getDashboardStats();
            return response.data.data;
        }
    });

    // Fetch links
    const { data: linksData, isLoading } = useQuery({
        queryKey: ['links'],
        queryFn: async () => {
            const response = await linksAPI.getAll();
            return response.data.data;
        }
    });

    const filteredAndSortedLinks = useMemo(() => {
        if (!linksData) return [];

        let filtered = [...linksData];

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(link => {
                const title = (link.title || '').toLowerCase();
                const url = (link.originalUrl || '').toLowerCase();
                const shortCode = (link.shortCode || '').toLowerCase();
                return title.includes(query) || url.includes(query) || shortCode.includes(query);
            });
        }

        // Category Filter
        if (filterBy === 'most-clicked') {
            filtered = filtered.filter(link => link.clicks > 0);
            filtered.sort((a, b) => b.clicks - a.clicks);
        }
        else if (filterBy === 'recent') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(link => new Date(link.createdAt) >= sevenDaysAgo);
        }

        // Sort Order
        if (filterBy === 'all') {
            filtered.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
        }

        return filtered;
    }, [linksData, searchQuery, filterBy, sortOrder]);

    // Bulk Operations
    const toggleSelectLink = (linkId) => {
        setSelectedLinks(prev => {
            const newSelection = prev.includes(linkId)
                ? prev.filter(id => id !== linkId)
                : [...prev, linkId];
            return newSelection;
        });
    };

    const toggleSelectAll = () => {
        if (!filteredAndSortedLinks || filteredAndSortedLinks.length === 0) return;

        if (!selectedLinks) {
            setSelectedLinks([]);
            return;
        }

        if (selectedLinks.length === filteredAndSortedLinks.length) {
            setSelectedLinks([]);
        } else {
            setSelectedLinks(filteredAndSortedLinks.map(link => link._id));
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedLinks || selectedLinks.length === 0) return;

        const confirmed = confirm(`Are you sure you want to delete ${selectedLinks.length} selected link(s)?`);
        if (!confirmed) return;

        setBulkDeleteLoading(true);

        try {
            await Promise.all(selectedLinks.map(id => linksAPI.delete(id)));

            queryClient.invalidateQueries(['links']);
            queryClient.invalidateQueries(['dashboardStats']);

            setSelectedLinks([]);
        }
        catch (error) {
            console.error('Bulk delete failed:', error);
            alert('Failed to delete selected links. Please try again.');
        }
        finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleExportSelected = () => {
        if (selectedLinks.length === 0) return;

        const selectedLinksData = linksData.filter(link => selectedLinks.includes(link._id));

        const exportData = selectedLinksData.map(link => ({
            title: link.title || 'Untitled',
            originalUrl: link.originalUrl,
            shortUrl: link.shortUrl,
            shortCode: link.shortCode,
            clicks: link.clicks,
            createdAt: link.createdAt,
            isActive: link.isActive
        }));

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shortlink-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    // Create link
    const createLinkMutation = useMutation({
        mutationFn: (data) => linksAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            queryClient.invalidateQueries(['dashboardStats']);
            setFormData({ originalUrl: '', customAlias: '', title: '' });
            setShowCreateForm(false);
            setFormError('');
        },
        onError: (error) => {
            setFormError(error.response?.data?.message || 'Failed to create link');
        }
    });

    // Delete link
    const deleteLinkMutation = useMutation({
        mutationFn: (id) => linksAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            queryClient.invalidateQueries(['dashboardStats']);
        }
    });

    const handleCreateLink = (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.originalUrl) {
            setFormError('Please provide the original URL');
            return;
        }

        const submitData = {
            originalUrl: formData.originalUrl,
            customAlias: formData.customAlias || undefined,
            title: formData.title || undefined,
            expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
        };

        createLinkMutation.mutate(submitData);
    }

    const handleCopy = async (shortUrl, linkId) => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopySuccess(linkId);
            setTimeout(() => setCopySuccess(null), 2000);
        }
        catch (error) {
            console.error('Failed to copy: ', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    const handleShowQR = async (link) => {
        setSelectedLink(link);
        setShowQRModal(true);

        // Generate QR code
        setTimeout(async () => {
            if (qrCanvasRef.current) {
                await QRCodeCanvas.toCanvas(qrCanvasRef.current, link.shortUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#9333ea',
                        light: '#ffffff'
                    }
                });
            }
        }, 100);
    };

    const handleDownloadQR = () => {
        if (qrCanvasRef.current) {
            const url = qrCanvasRef.current.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `qr-${selectedLink.shortCode}.png`;
            link.href = url;
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
            {/* Navbar */}
            <nav className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 transition-colors duration-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-primary-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">ShortLink</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Links</h1>
                    <p className="text-gray-600 dark:text-gray-400">Create and manage your short links</p>
                </div>

                {/* Stats Cards */}
                {statsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 animate-pulse">
                                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded mb-2"></div>
                                <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Total Links */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Link2 className="w-6 h-6" />
                                </div>
                                <TrendingUp className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1">Total Links</p>
                            <p className="text-3xl font-bold">{dashboardStats?.totalLinks || 0}</p>
                            <p className="text-xs opacity-75 mt-2">
                                {dashboardStats?.recentLinksCount || 0} created this week
                            </p>
                        </div>

                        {/* Total Clicks */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <MousePointerClick className="w-6 h-6" />
                                </div>
                                <BarChart3 className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1">Total Clicks</p>
                            <p className="text-3xl font-bold">{dashboardStats?.totalClicks || 0}</p>
                            <p className="text-xs opacity-75 mt-2">
                                Across all your links
                            </p>
                        </div>

                        {/* Most Popular Link */}
                        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Award className="w-6 h-6" />
                                </div>
                                <TrendingUp className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1">Most Popular</p>
                            {dashboardStats?.mostPopularLink ? (
                                <>
                                    <p className="text-2xl font-bold truncate">
                                        {dashboardStats.mostPopularLink.clicks} clicks
                                    </p>
                                    <p className="text-xs opacity-75 mt-2 truncate">
                                        {dashboardStats.mostPopularLink.title}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl font-bold">-</p>
                                    <p className="text-xs opacity-75 mt-2">No links yet</p>
                                </>
                            )}
                        </div>

                        {/* Average Clicks */}
                        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <BarChart3 className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1">Avg. per Link</p>
                            <p className="text-3xl font-bold">
                                {dashboardStats?.totalLinks > 0
                                    ? Math.round(dashboardStats.totalClicks / dashboardStats.totalLinks)
                                    : 0}
                            </p>
                            <p className="text-xs opacity-75 mt-2">
                                Average clicks per link
                            </p>
                        </div>
                    </div>
                )}

                {/* Bulk Operations Bar */}
                {selectedLinks && selectedLinks.length > 0 && (
                    <div className="mb-6 bg-primary-600 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="w-5 h-5 text-white" />
                            <span className="text-white font-medium">
                                {selectedLinks?.length || 0} link{(selectedLinks?.length || 0) !== 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                            >
                                <FileDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleteLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {bulkDeleteLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                            <button
                                onClick={() => setSelectedLinks([])}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, URL, or short code..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Filter and Sort Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
                        </div>

                        <button
                            onClick={() => setFilterBy('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterBy === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            All Links
                        </button>

                        <button
                            onClick={() => setFilterBy('most-clicked')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterBy === 'most-clicked'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            Most Clicked
                        </button>

                        <button
                            onClick={() => setFilterBy('recent')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterBy === 'recent'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                }`}
                        >
                            Recent (7 days)
                        </button>

                        {/* Sort Order (only for 'all' filter) */}
                        {filterBy === 'all' && (
                            <>
                                <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700"></div>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                                >
                                    {sortOrder === 'desc' ? (
                                        <>
                                            <SortDesc className="w-4 h-4" />
                                            Newest First
                                        </>
                                    ) : (
                                        <>
                                            <SortAsc className="w-4 h-4" />
                                            Oldest First
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Results Count */}
                    {searchQuery && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Found {filteredAndSortedLinks.length} result{filteredAndSortedLinks.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Create Link Button */}
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="mb-6 flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Link
                    </button>
                )}

                {/* Create Link Form */}
                {showCreateForm && (
                    <div className="mb-8 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Short Link</h2>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormError('');
                                }}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 dark:text-red-400 text-sm">{formError}</p>
                            </div>
                        )}

                        <form onSubmit={handleCreateLink} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Original URL *
                                </label>
                                <input
                                    type="url"
                                    value={formData.originalUrl}
                                    onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                                    placeholder="https://example.com/very-long-url"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Custom Alias (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.customAlias}
                                    onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
                                    placeholder="my-custom-link"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Title (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="My Link"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expiration Date (optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Link will stop working after this date/time
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={createLinkMutation.isPending}
                                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {createLinkMutation.isPending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Link'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setFormError('');
                                    }}
                                    className="px-6 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Select All Checkbox */}
                {filteredAndSortedLinks && filteredAndSortedLinks.length > 0 && (
                    <div className="mb-4 flex items-center gap-3 px-2">
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {selectedLinks.length === filteredAndSortedLinks.length && filteredAndSortedLinks.length > 0 ? (
                                <CheckSquare className="w-5 h-5 text-primary-500" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                            <span className="text-sm">
                                {selectedLinks.length === filteredAndSortedLinks.length && filteredAndSortedLinks.length > 0 ? 'Deselect All' : 'Select All'}
                            </span>
                        </button>
                    </div>
                )}

                {/* Links List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : filteredAndSortedLinks.length === 0 ? (
                    <div className="text-center py-20">
                        <Link2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery || filterBy !== 'all' ? 'No links found' : 'No links yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchQuery || filterBy !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first short link to get started'}
                        </p>
                        {(searchQuery || filterBy !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterBy('all');
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredAndSortedLinks.map((link) => {
                            const expStatus = link.expiresAt ? getExpirationStatus(link.expiresAt) : null;
                            const isExpired = expStatus?.status === 'expired';

                            return (
                                <div
                                    key={link._id}
                                    className={`bg-white dark:bg-zinc-800 border rounded-2xl p-6 transition-all ${isExpired
                                            ? 'opacity-60 border-red-300 dark:border-red-800'
                                            : selectedLinks && selectedLinks.includes(link._id)
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/5'
                                                : 'border-gray-200 dark:border-zinc-700 hover:border-primary-500/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleSelectLink(link._id)}
                                            className="mt-1 flex-shrink-0"
                                        >
                                            {selectedLinks && selectedLinks.includes(link._id) ? (
                                                <CheckSquare className="w-5 h-5 text-primary-500" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" />
                                            )}
                                        </button>

                                        {/* Link Content */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-1 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                                    {link.title || 'Untitled Link'}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-md mb-2 truncate">
                                                    {link.originalUrl}
                                                </p>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <code className="px-3 py-1 bg-gray-100 dark:bg-zinc-900 text-primary-400 rounded-lg text-md font-mono">
                                                        {link.shortUrl}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopy(link.shortUrl, link._id)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                                        title="Copy to clipboard"
                                                    >
                                                        {copySuccess === link._id ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4 text-md text-gray-600 dark:text-gray-400">
                                                    <span>👆 {link.clicks} clicks</span>
                                                    <span>📅 {new Date(link.createdAt).toLocaleDateString()}</span>

                                                    {/* Expiration Badge */}
                                                    {link.expiresAt && (() => {
                                                        const expStatus = getExpirationStatus(link.expiresAt);
                                                        if (!expStatus) return null;

                                                        const Icon = expStatus.icon;

                                                        const colorClasses = {
                                                            red: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
                                                            orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
                                                            yellow: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
                                                            blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
                                                            green: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30'
                                                        };

                                                        return (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${colorClasses[expStatus.color]}`}>
                                                                <Icon className="w-3 h-3" />
                                                                {expStatus.message}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col gap-2">
                                                <button
                                                    onClick={() => handleShowQR(link)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                                                    title="QR Code"
                                                >
                                                    <QrCode className="w-4 h-4" />
                                                    <span className="hidden sm:inline">QR</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/links/${link._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                                >
                                                    <BarChart3 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Analytics</span>
                                                </button>
                                                {isExpired ? (
                                                    <button
                                                        disabled
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-gray-600 rounded-xl cursor-not-allowed"
                                                        title="Link has expired"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Expired</span>
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={link.shortUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Visit</span>
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this link?')) {
                                                            deleteLinkMutation.mutate(link._id);
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {showQRModal && selectedLink && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 max-w-md w-full transition-colors duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">QR Code</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-center mb-4">
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{selectedLink.title || 'Untitled Link'}</p>
                            <code className="text-primary-400 text-sm">{selectedLink.shortUrl}</code>
                        </div>

                        <div className="flex justify-center mb-4 bg-white p-4 rounded-xl">
                            <canvas ref={qrCanvasRef}></canvas>
                        </div>

                        <button
                            onClick={handleDownloadQR}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download QR Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}