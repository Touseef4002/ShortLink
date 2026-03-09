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
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
                                <style>
                                    body { margin: 0; padding: 0; background-color: #F5F5F0; font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif; color: #0A0A0A; line-height: 1.6; }
                                    .wrapper { max-width: 520px; margin: 0 auto; padding: 40px 20px; }
                                    .header { text-align: center; padding-bottom: 28px; border-bottom: 1px solid #E5E5E0; margin-bottom: 28px; }
                                    .logo { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
                                    .logo-icon { width: 28px; height: 28px; background-color: #0A0A0A; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; }
                                    .logo-icon svg { width: 14px; height: 14px; }
                                    .logo-text { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 18px; color: #0A0A0A; }
                                    .card { background: #FFFFFF; border: 1px solid #E5E5E0; border-radius: 12px; padding: 32px; }
                                    .greeting { font-size: 14px; color: #6B6B6B; margin: 0 0 16px 0; }
                                    .heading { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 28px; color: #0A0A0A; margin: 0 0 12px 0; line-height: 1.2; }
                                    .body-text { font-size: 14px; color: #6B6B6B; margin: 0 0 24px 0; line-height: 1.6; }
                                    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background-color: #0A0A0A; color: #FFFFFF !important; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 8px; }
                                    .btn:hover { background-color: rgba(10,10,10,0.9); }
                                    .btn-accent { width: 20px; height: 20px; background-color: #DC2626; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; }
                                    .btn-accent svg { width: 12px; height: 12px; }
                                    .link-text { font-size: 13px; color: #0A0A0A; word-break: break-all; background: #F5F5F0; border: 1px solid #E5E5E0; border-radius: 8px; padding: 12px; margin: 20px 0; }
                                    .notice { border: 1px solid #E5E5E0; border-radius: 8px; padding: 16px; margin: 24px 0 0 0; }
                                    .notice-title { font-size: 13px; font-weight: 600; color: #0A0A0A; margin: 0 0 8px 0; }
                                    .notice ul { margin: 0; padding-left: 18px; }
                                    .notice li { font-size: 13px; color: #6B6B6B; margin-bottom: 4px; }
                                    .footer { text-align: center; padding-top: 28px; margin-top: 28px; border-top: 1px solid #E5E5E0; }
                                    .footer p { font-size: 12px; color: #A0A0A0; margin: 0; }
                                </style>
                            </head>
                            <body>
                                <div class="wrapper">
                                    <div class="header">
                                        <a href="\${process.env.FRONTEND_URL || '#'}" class="logo">
                                            <span class="logo-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                            </span>
                                            <span class="logo-text">ShortLink</span>
                                        </a>
                                    </div>

                                    <div class="card">
                                        <p class="greeting">Hi ${username},</p>
                                        <h1 class="heading">Reset your password</h1>
                                        <p class="body-text">We received a request to reset the password for your ShortLink account. Click the button below to choose a new one.</p>

                                        <div style="text-align: center; margin: 28px 0;">
                                            <a href="${resetUrl}" class="btn">
                                                <span class="btn-accent">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                                </span>
                                                Reset Password
                                            </a>
                                        </div>

                                        <p style="font-size: 13px; color: #A0A0A0; margin-bottom: 4px;">Or copy this link into your browser:</p>
                                        <div class="link-text">${resetUrl}</div>

                                        <div class="notice">
                                            <p class="notice-title">Security notice</p>
                                            <ul>
                                                <li>This link expires in 1 hour</li>
                                                <li>Never share this link with anyone</li>
                                                <li>If you didn't request this, ignore this email</li>
                                            </ul>
                                        </div>
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