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

linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ shortCode: 1, isActive: 1 }); 

linkSchema.virtual('shortUrl').get(function() {
  return `${process.env.BASE_URL}/${this.shortCode}`;
});

linkSchema.set('toJSON', { virtuals: true });
linkSchema.set('toObject', { virtuals: true });

linkSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

linkSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  return await this.save();
};

module.exports = mongoose.model('Link', linkSchema)