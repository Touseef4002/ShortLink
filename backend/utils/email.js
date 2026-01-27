const nodemailer = require('nodemailer');

//create transporter
const createTransporter = () => {
    if(process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else{
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER || 'your-ethereal-user@thereal.email',
                pass: process.env.ETHEREAL_PASS || 'your-ethereal-password'
            }
        });
    }
}

const sendVerificationEmail = async (email, verificationToken, username) => {
    try{
        const transporter = createTransporter();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        
        const mailOptions = {
            from: `"ShortLink" <${process.env.SMTP_FROM || 'no-reply@shortlink.com'}>`,
            to : email,
            subject: 'Email Verification - ShortLink',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: #9333ea;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #6b7280;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔗 Welcome to ShortLink!</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName},</p>
                            <p>Thanks for signing up! Please verify your email address to activate your account.</p>
                            <p style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #9333ea;">${verificationUrl}</p>
                            <p>This link will expire in 24 hours.</p>
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 ShortLink. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Verification email sent: %s', info.messageId);

        if(process.env.NODE_ENV !== 'production') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return {success: true, messageId: info.messageId};
    }
    catch(error){
        console.error('Error sending verification email:', error);
        return {success: false, error: error.message};
    }
};

const sendPasswordResetEmail = async (email, resetToken, username) => {
    try{
        const transporter = createTransporter();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: `"ShortLink" <${process.env.SMTP_FROM || 'no-reply@shortlink.com'}>`,
            to : email,
            subject: 'Password Reset - ShortLink',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: #9333ea;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .warning {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #6b7280;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName},</p>
                            <p>We received a request to reset your password for your ShortLink account.</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #9333ea;">${resetUrl}</p>
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul>
                                    <li>This link expires in 1 hour</li>
                                    <li>Never share this link with anyone</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                </ul>
                            </div>
                            <p>If you didn't request a password reset, your account is still secure and you can ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 ShortLink. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Password reset email sent: %s', info.messageId);

        if(process.env.NODE_ENV !== 'production') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return {success: true, messageId: info.messageId};
    }
    catch(error){
        console.error('Error sending password reset email:', error);
        return {success: false, error: error.message};
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};