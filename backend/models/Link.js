const mongoose = require('mongoose')

const linkSchema = new mongoose.Schema({
    originalUrl:{
        type: String,
        required: [true, "Original URL is required"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please enter a valid URL'
    }},
    shortCode:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    customAlias:{
        type: String,
        trim: true,
        sparse: true,
        unique: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:{
        type: String,
        trim: true,
        default: ''
    },
    clicks:{
        type: Number,
        default: 0
    },
    isActive:{
        type: Boolean,
        default: true
    },
    expiresAt:{
        type: Date,
        default: null
    }
}, 
{
    timestamps: true
})

module.exports = mongoose.model('Link', linkSchema)