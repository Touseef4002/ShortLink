const Analytics = require('../models/Analytics');
const Link = require('../models/Link');

const getLinkAnalytics = async (req, res) => {
    try{
        const {linkId} = req.params;

        const link = await Link.findById(linkId);
        if(!link){ 
            return res.status(404).json({
                success: false, 
                message: 'Link not found'
            });
        }

        if(link.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false, 
                message: 'Not authorized to access the link analytics'
            });
        }

        const analytics = await Analytics.find({linkId}).sort({timestamp: -1}).limit(1000);

        res.status(200).json({
            success: true,
            count: analytics.length,
            data: analytics
        });
    }
    catch(error){
        console.error('Get link analytics error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting link analytics'
        });
    }
}

const getAnalyticsSummary = async (req, res) => {
    try{
        const {linkId} = req.params;

        const link = await Link.findById(linkId);

        if(!link){
            return res.status(404).json({
                success: false,
                message: 'Link not found'
            });
        }

        if(link.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false, 
                message: 'Not authorized to access the link analytics summary'
            });
        }

        const allAnalytics = await Analytics.find({linkId});

        const summary = {
            totalClicks: allAnalytics.length,

            byCountry: groupBy(allAnalytics, 'country'),

            byDevice: groupBy(allAnalytics, 'device'),

            byBrowser: groupBy(allAnalytics, 'browser'),
            
            byOs: groupBy(allAnalytics, 'os'),
            
            byReferrer: groupBy(allAnalytics, 'referrer'),

            recentClicks : getRecentClicks(allAnalytics, 30),

            uniqueVisitors: countUnique(allAnalytics, 'ipHash')
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    }
    catch(error){
        console.error('Get analytics summary error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting analytics summary'
        });
    }
}

const getDashboardStats = async (req, res) => {
    try{
        const userId = req.user._id;

        //get all user's links
        const userLinks = await Link.find({userId});

        const totalLinks = userLinks.length;

        const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);
        
        const mostPopularLink = userLinks.length > 0 
            ? userLinks.reduce((max, link) => (link.clicks > max.clicks ? link : max), userLinks[0])
            : null;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLinksCount = userLinks.filter(link => new Date(link.createdAt) >= sevenDaysAgo).length;

        res.status(200).json({
            success: true,
            data: {
                totalLinks,
                totalClicks,
                mostPopularLink : mostPopularLink ? {
                    _id: mostPopularLink._id,
                    title: mostPopularLink.title || 'Untitled Link',
                    shortCode: mostPopularLink.shortCode,
                    shortUrl: mostPopularLink.shortUrl,
                    clicks: mostPopularLink.clicks,
                    originalUrl: mostPopularLink.originalUrl
                } : null,
                recentLinksCount
            }
        });
    }
    catch(error){
        console.error('Get dashboard stats error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting dashboard stats'
        });
    }
}

const groupBy = (array, field) => {
    const grouped = {};

    array.forEach(item => {
        const key = item[field] || 'Unknown';
        grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
           .map(([name, count]) => ({name, count}))
           .sort((a, b) => b.count - a.count);
}

const getRecentClicks = (array, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentClicks = array.filter(item => new  Date(item.timestamp) >= cutoffDate);

    const byDate = {};
    recentClicks.forEach(item => {
        const date = new Date(item.timestamp).toISOString().split('T')[0];
        byDate[date] = (byDate[date] || 0) + 1;
    })

    return Object.entries(byDate)
           .map(([date, count]) => ({date, count}))
           .sort((a, b) => new Date(a.date) - new Date(b.date));
}

const countUnique = (array, field) => {
    const unique = new Set();
    array.forEach(item => {
        if(item[field]){
            unique.add(item[field]);
        }
    });
    return unique.size;
}

module.exports = {
    getLinkAnalytics,
    getAnalyticsSummary,
    getDashboardStats
}