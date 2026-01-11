import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { linksAPI, analyticsAPI } from '../services/api';
import {
    ArrowLeft, Link2, Copy, ExternalLink, Eye, MapPin,
    Smartphone, Globe, TrendingUp, CheckCircle, Loader
} from 'lucide-react';
import { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


export default function LinkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copySuccess, setCopySuccess] = useState(false);

    // Fetch link details
    const { data: linkData, isLoading: linkLoading } = useQuery({
        queryKey: ['link', id],
        queryFn: async () => {
            const response = await linksAPI.getById(id);
            return response.data.data;
        }
    });

    // Fetch analytics data
    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['analytics', id],
        queryFn: async () => {
            const response = await analyticsAPI.getSummary(id);
            return response.data.data;
        },
        enabled: !!linkData
    });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(linkData?.shortUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
        catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    if (linkLoading || analyticsLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!linkData) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Link not found</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-primary-500 hover:text-primary-400"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    //Prepare data for charts
    const clicksData = analyticsData?.recentClicks?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        clicks: item.count
    })) || [];

    const deviceData = analyticsData?.byDevice?.map(item => ({
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        value: item.count
    })) || [];

    const countryData = analyticsData?.byCountry?.slice(0, 5).map(item => ({
        name: item.name,
        clicks: item.count
    })) || [];

    const COLORS = ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Header */}
            <div className="bg-zinc-800 border-b border-zinc-700">
                <div className="container mx-auto px-4 py-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {linkData.title || 'Untitled Link'}
                            </h1>
                            <p className="text-gray-400 text-sm mb-3 break-all">
                                {linkData.originalUrl}
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="px-3 py-1 bg-zinc-900 text-primary-400 rounded-lg text-sm font-mono">
                                    {linkData.shortUrl}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copySuccess ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                                <a
                                    href={linkData.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                    title="Visit link"
                                >
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <Eye className="w-5 h-5 text-primary-500" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Clicks</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{analyticsData?.totalClicks || 0}</p>
                    </div>

                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <MapPin className="w-5 h-5 text-primary-500" />
                            </div>
                            <span className="text-gray-400 text-sm">Countries</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{analyticsData?.byCountry?.length || 0}</p>
                    </div>

                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <Smartphone className="w-5 h-5 text-primary-500" />
                            </div>
                            <span className="text-gray-400 text-sm">Unique Visitors</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{analyticsData?.uniqueVisitors || 0}</p>
                    </div>

                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-primary-500" />
                            </div>
                            <span className="text-gray-400 text-sm">Avg. Daily</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {analyticsData?.recentClicks?.length > 0
                                ? Math.round(analyticsData.totalClicks / analyticsData.recentClicks.length)
                                : 0}
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Clicks Over Time */}
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Clicks Over Time</h3>
                        {clicksData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={clicksData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#27272a',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="clicks" stroke="#9333ea" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No click data yet
                            </div>
                        )}
                    </div>

                    {/* Device Breakdown */}
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
                        {deviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={deviceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#27272a',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No device data yet
                            </div>
                        )}
                    </div>

                    {/* Top Countries */}
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
                        {countryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={countryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#27272a',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="clicks" fill="#9333ea" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No location data yet
                            </div>
                        )}
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Referrers</h3>
                        {analyticsData?.byReferrer?.length > 0 ? (
                            <div className="space-y-3">
                                {analyticsData.byReferrer.slice(0, 5).map((referrer, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-primary-500" />
                                            </div>
                                            <span className="text-white">{referrer.name}</span>
                                        </div>
                                        <span className="text-gray-400">{referrer.count} clicks</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No referrer data yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}