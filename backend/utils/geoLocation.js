const axios = require('axios');
const crypto = require('crypto');
const UAParser = require('ua-parser-js');

const getLocationFromIP = async (ip) => {
    try{
        if(ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')){
            return{
                country: 'local',
                city: 'local',
                region: 'local'
            }
        }

        const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
            timeout: 3000
        })

        return {
            country: response.data.country_name || 'Unknown',
            city: response.data.city || 'Unknown',
            region: response.data.region || 'Unknown'
        }
    }
    catch(e){
        console.error('Geolocation error', e.message);
        return{
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown'
        }
    }
}

const parseDeviceInfo = (userAgent) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType = 'Unknown';
    if(result.device.type) deviceType = result.device.type;
    else if (result.os.name) deviceType = result.os.name;

    return{
        device: deviceType,
        os: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown'
    }
}

const extractReferrerDomain = (referrer) => {
    if(!referrer || referrer === '') return 'direct';
    try{
        const url = new URL(referrer);
        return url.hostname.replace('www.', '');
    }
    catch(e){
        return 'direct';
    }
}

const hashIP = (ip) => {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = {
    getLocationFromIP,
    parseDeviceInfo,
    extractReferrerDomain,
    hashIP
}