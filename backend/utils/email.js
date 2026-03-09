const mailjet = require('node-mailjet').apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
);

const sendPasswordResetEmail = async (email, resetToken, username) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const request = await mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: process.env.SMTP_FROM,
                            Name: 'ShortLink'
                        },
                        To: [
                            {
                                Email: email,
                                Name: username
                            }
                        ],
                        Subject: 'Password Reset - ShortLink',
                        HTMLPart: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                    .header { background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                                    .button { display: inline-block; padding: 12px 30px; background: #9333ea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
                                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h1>🔑 Password Reset</h1>
                                    </div>
                                    <div class="content">
                                        <p>Hi ${username},</p>
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
                                        <p>&copy; 2026 ShortLink. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    }
                ]
            });

        console.log('✅ Password reset email sent successfully:', request.body);
        return { success: true, messageId: request.body.Messages[0].To[0].MessageID };
    }
    catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail
};