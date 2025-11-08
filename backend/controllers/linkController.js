const Link = require('../models/Link');
const {generateShortCode} = require('../utils/generateShortCode');
const {validateCustomAlias} = require('../utils/validateCustomAlias');

const createLink = async(req, res) => {
    try{
        const {originalUrl, customAlias, title, expiresAt} = req.body;

        if(!originalUrl) {
            return res.status(400).json({
                success: false, 
                message: 'Original URL is required'
            });
        }

        let formattedUrl = originalUrl;
        if(!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
            formattedUrl = 'https://' + originalUrl;
        }

        let shortCode;

        if(customAlias){
            const validation = validateCustomAlias(customAlias);
            if(!validation.valid) {
                return res.status(400).json({
                    success: false, 
                    message: validation.message
                });
            }

            const existingAlias = await Link.findOne({customAlias});
            if(existingAlias) {
                return res.status(400).json({
                    success: false, 
                    message: 'Custom alias already exists'
                });
            }

            shortCode = customAlias;
        }
        else{
            shortCode = await generateShortCode();
        }

        const link = await Link.create({
            originalUrl: formattedUrl,
            shortCode,
            customAlias: customAlias || null,
            userId: req.user._id,
            title: title || '',
            expiresAt: expiresAt || null
        })

        res.status(201).json({
            success: true,
            data: link
        });
    }
    catch(error){
        console.error('Create link error', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating link'
        });
    }
}

const getAllLinks = async(req, res) => {
    try{
        const links = await Link.find({userId: req.user._id}).sort({createdAt: -1});

        res.status(200).json({
            success: true,
            count: links.length,
            data: links
        });
    }
    catch(error){
        console.error('Get all links error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting all links'
        });
    }
}

const getLinkById = async(req, res) => {
    try{
        const link = await Link.findById(req.params.id);

        if(!link) {
            return res.status(404).json({
                success: false,
                message: 'Link not found'
            });
        }

        if(link.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this link'
            });
        }

        res.status(200).json({
            success: true,
            data: link
        });
    }
    catch(error){
        console.error('Get link by id error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting link by id'
        });
    }
}