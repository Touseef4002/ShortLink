const Joi = require('joi');

const schemas = {
    //user reg
    register: Joi.object({
        name: Joi.string().min(3).max(30).trim().required()
        .messages({
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
        email: Joi.string().email().lowercase().trim().required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).max(128).required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password is too long',
            'any.required': 'Password is required'
        })
    }),

    //user login
    login: Joi.object({
        email: Joi.string().email().lowercase().trim().required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required()
        .messages({
            'any.required': 'Password is required'
        })
    }),

    //create link
    createLink: Joi.object({
        originalUrl: Joi.string()
            .uri({ scheme: ['http', 'https'] })
            .required()
            .messages({
                'string.uri': 'Please provide a valid URL',
                'any.required': 'URL is required'
            }),
        customAlias: Joi.string()
            .pattern(/^[a-zA-Z0-9_-]+$/)
            .min(3)
            .max(20)
            .optional()
            .messages({
                'string.pattern.base': 'Alias can only contain letters, numbers, hyphens, and underscores',
                'string.min': 'Alias must be at least 3 characters',
                'string.max': 'Alias cannot exceed 20 characters'
            }),
        title: Joi.string()
            .max(100)
            .trim()
            .optional()
            .allow('')
            .messages({
                'string.max': 'Title cannot exceed 100 characters'
            }),
        expiresAt: Joi.date()
            .greater('now')
            .optional()
            .messages({
                'date.greater': 'Expiration date must be in the future'
            })
    }),

    // Update link
    updateLink: Joi.object({
        title: Joi.string()
            .max(100)
            .trim()
            .optional()
            .allow(''),
        isActive: Joi.boolean().optional(),
        expiresAt: Joi.date()
            .optional()
            .allow(null)
    }).min(1) // At least one field required
}

//validation middleware
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if(!schema){
            return res.status(500).json({
                success: false,
                message: 'Validation schema not found'
            });
        }

        const {error, value} = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })

        if(error){
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        req.body = value;
        next();
    }
}

const isValidEmail = (email) => {
    const emailSchema = Joi.string().email();
    const { error } = emailSchema.validate(email);
    return !error;
}

const isValidUrl = (url) => {
    const urlSchema = Joi.string().uri({ scheme: ['http', 'https'] });
    const { error } = urlSchema.validate(url);
    return !error;
}

module.exports = {
    validate,
    schemas,
    isValidEmail,
    isValidUrl
}