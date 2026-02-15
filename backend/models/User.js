const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto'); 

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"]
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password:{
        type:String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationTokenExpires: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    }
},{
    timestamps: true
})

userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch(error){
        next(error);
    }
})

userSchema.methods.comparePassword = async function(userPass) {
    try{
        return await bcrypt.compare(userPass, this.password);
    }
    catch(error){
        throw new Error("Password comparison failed");
    }
}

//generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
}

userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);