const User = require('../models/User');
const {generateToken} = require('../middleware/auth');

const register = async(req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password) return res.status(400).json({success: false, message: 'All fields are required'});

        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({success: false, message: 'User already exists'});
        }

        const user = await User.create({name, email, password});

        res.status(201).json({
            success: true,
            data:{
                _id : user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            }
        });
    }
    catch(error){
        console.error('Register Error',error);
        res.status(500).json({success: false, message: 'Server error during registration'});
    }
}

const login = async(req,res) => {
    try{
        const {email, password} = req.body;

        if(!email || !password) return res.status(400).json({success: false, message: 'All fields are required'});

        const user = await User.findOne({email}).select('+password');
        if(!user) return res.status(401).json({
            success: false, 
            message: 'Invalid credentials'
        });

        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect) return res.status(401).json({
            success: false, 
            message: 'Invalid credentials'
        });


        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            }
        });
    }
    catch(error){
        console.error('Login Error',error);
        res.status(500).json({success: false, message: 'Server error during login'});
    }
}

const getMe = async(req, res) => {
    try{
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});
    }
    catch(error){
        console.error('Get User Error', error);
        res.status(500).json({success: false, message: 'Server error getting user'});
    }
}

module.exports = {
    register,
    login,
    getMe
}