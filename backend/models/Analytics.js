const mongoose = require('mongoose')

const analyticsSchema = new mongoose.Schema({
    linkId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link',
        required: true,
        index: true
    },
    timestamp:{
        type: Date,
        default: Date.now,
        index: true
    },
    country:{
        type: String,
        default: 'Unknown'
    },
    city:{
        type: String,
        default: 'Unknown'
    },
    region:{
        type: String,
        default: 'Unknown'
    },

    device:{
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'unknown'],
        default: 'unknown'
    },
    os:{
        type: String,
        default: 'Unknown'
    },
    browser:{
        type: String,
        default: 'Unknown'
    },
    referrer:{
        type: String,
        default: 'Direct'
    },
    referrerDomain:{
        type: String,
        default: 'Direct'
    },
    userAgent:{
        type:String
    },
    ipHash:{
        type:String
    }
},{
    timestamps: true
})


analyticsSchema.index({ linkId: 1, timestamp: -1 });
analyticsSchema.index({ linkId: 1, country: 1 });
analyticsSchema.index({ linkId: 1, device: 1 });
analyticsSchema.index({ linkId: 1, referrerDomain: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);