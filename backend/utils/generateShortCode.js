const {nanoid} = require('nanoid')
const Link = require('../models/Link')

const generateShortCode = async (length = 6) => {
    let shortCode;
    let isUnique = false;

    while(!isUnique){
        shortCode = nanoid(length);

        const existingLink = await Link.findOne({shortCode});
        if(!existingLink) isUnique = true;
    }

    return shortCode;
}

const validateCustomAlias = (alias) => {
  if (alias.length < 3) {
    return { valid: false, message: 'Alias must be at least 3 characters long' };
  }
  
  if (alias.length > 20) {
    return { valid: false, message: 'Alias must be less than 20 characters' };
  }
  
  const aliasRegex = /^[a-zA-Z0-9_-]+$/;
  if (!aliasRegex.test(alias)) {
    return { 
      valid: false, 
      message: 'Alias can only contain letters, numbers, hyphens, and underscores' 
    };
  }
  
  const reservedWords = ['api', 'admin', 'dashboard', 'login', 'register', 'health', 'analytics'];
  if (reservedWords.includes(alias.toLowerCase())) {
    return { valid: false, message: 'This alias is reserved' };
  }
  
  return { valid: true };
};

module.exports = {
    generateShortCode,
    validateCustomAlias
}