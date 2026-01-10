import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { linksAPI } from '../services/api';
import {
    Link2, Plus, Copy, ExternalLink, Trash2, BarChart3,
    LogOut, User, AlertCircle, CheckCircle, Loader
} from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        originalUrl: '',
        customAlias: '',
        title: ''
    });

    const [copySuccess, setCopySuccess] = useState(null);
    const [formError, setFormError] = useState('');

    const { data: linksData, isLoading } = useQuery({
        queryKey: ['links'],
        queryFn: async () => {
            const response = await linksAPI.getAll();
            return response.data.data;
        }
    });

    const createLinkMutation = useMutation({
        mutationFn: (data) => linksAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
            setFormData({ originalUrl: '', customAlias: '', title: '' });
            setShowCreateForm(false);
            setFormError('');
        },
        onError: (error) => {
            setFormError(error.response?.data?.message || 'Failed to create link');
        }
    });

    const deleteLinkMutation = useMutation({
        mutationFn: (id) => linksAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['links']);
        }
    });

    const handleCreateLink = (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.originalUrl) {
            setFormError('Please provide the original URL');
            return;
        }

        createLinkMutation.mutate(formData);
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

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Navbar */}
            <nav className="bg-zinc-800 border-b border-zinc-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-primary-500" />
                            <span className="text-2xl font-bold text-white">ShortLink</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-300">
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors"
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
                    <h1 className="text-3xl font-bold text-white mb-2">Your Links</h1>
                    <p className="text-gray-400">Create and manage your short links</p>
                    <p className="text-gray-400">You have {linksData?.length || 0} links</p>
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
                    <div className="mb-8 bg-zinc-800 border border-zinc-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Create Short Link</h2>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormError('');
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-500 text-sm">{formError}</p>
                            </div>
                        )}

                        <form onSubmit={handleCreateLink} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Original URL *
                                </label>
                                <input
                                    type="url"
                                    value={formData.originalUrl}
                                    onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                                    placeholder="https://example.com/very-long-url"
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Custom Alias (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.customAlias}
                                    onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
                                    placeholder="my-custom-link"
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="My Link"
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
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
                                    className="px-6 py-3 bg-zinc-700 text-white rounded-xl font-semibold hover:bg-zinc-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Links List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : linksData?.length === 0 ? (
                    <div className="text-center py-20">
                        <Link2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No links yet</h3>
                        <p className="text-gray-400 mb-6">Create your first short link to get started</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Link
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {linksData?.map((link) => (
                            <div
                                key={link._id}
                                className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                                            {link.title || 'Untitled Link'}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-2 truncate">
                                            {link.originalUrl}
                                        </p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <code className="px-3 py-1 bg-zinc-900 text-primary-400 rounded-lg text-sm font-mono">
                                                {link.shortUrl}
                                            </code>
                                            <button
                                                onClick={() => handleCopy(link.shortUrl, link._id)}
                                                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                {copySuccess === link._id ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span>👁 {link.clicks} clicks</span>
                                            <span>📅 {new Date(link.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/links/${link._id}`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors"
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Analytics</span>
                                        </button>
                                        <a
                                            href={link.shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="hidden sm:inline">Visit</span>
                                        </a>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this link?')) {
                                                    deleteLinkMutation.mutate(link._id);
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}