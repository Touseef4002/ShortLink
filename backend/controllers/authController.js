const User = require('../models/User');
const {generateToken} = require('../middleware/auth');
const crypto = require('crypto');
const {sendVerificationEmail, sendPasswordResetEmail} = require('../utils/email');

const register = async(req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password) return res.status(400).json({success: false, message: 'All fields are required'});

        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({success: false, message: 'User already exists'});
        }

        const user = await User.create({name, email, password});
        
        // Generate and send email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({validateBeforeSave: false});

        await sendVerificationEmail(user.email, verificationToken, user.name);


        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data:{
                _id : user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
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

        // Warn if email not verified (but still allow login)
        if(!user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                warning: 'Please verify your email address',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    token: generateToken(user._id)
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
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
        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({success: true, data: user});
    }
    catch(error){
        console.error('Get User Error', error);
        res.status(500).json({success: false, message: 'Server error getting user'});
    }
}

const verifyEmail = async(req, res) => {
    try{
        const {token} = req.params;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });

        if(!user){
            return res.status(400).json({
                success: false, 
                message: 'Invalid or expired verification token'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch(error){
        console.error('Email Verification Error', error);
        res.status(500).json({success: false, message: 'Server error during email verification'});
    }
}

//resend verification email
const resendVerificationEmail = async(req, res) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({email});

        if(!user || user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists and is unverified, a verification email has been sent.'
            });
        }

        const verificationToken = user.generateEmailVerificationToken();
        await user.save({validateBeforeSave: false});

        await sendVerificationEmail(email, verificationToken, user.name);
        
        res.status(200).json({
            success: true,
            message: 'If that email exists and is unverified, a verification email has been sent.'
        });
    }
    catch(error){
        console.error('Resend Verification Email Error', error);
        res.status(500).json({success: false, message: 'Server error during resending verification email'});
    }
}

// Request password reset
const forgotPassword = async(req, res) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user) {
            // Don't reveal if user exists - security best practice
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send email
        await sendPasswordResetEmail(email, resetToken, user.name);

        res.status(200).json({
            success: true,
            message: 'If that email exists, a password reset link has been sent.'
        });
    }
    catch(error){
        console.error('Forgot Password Error', error);
        res.status(500).json({success: false, message: 'Server error processing request'});
    }
};

// Reset password
const resetPassword = async(req, res) => {
    try{
        const {token} = req.params;
        const {password} = req.body;

        if(!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash the token from URL
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');

        if(!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });
    }
    catch(error){
        console.error('Reset Password Error', error);
        res.status(500).json({success: false, message: 'Server error resetting password'});
    }
};

module.exports = {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
}