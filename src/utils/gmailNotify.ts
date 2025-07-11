import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Gmail SMTP with alternative settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,  // Changed to port 587 which is more commonly used
    secure: false,  // Changed to false for TLS
    auth: {
        user: process.env.MANAGER_GMAIL,
        pass: process.env.MANAGER_GMAIL_PASSWORD
    },
});

export const sendMessagetoEmail = async (toEmail: string, content: string, walletAddress: string, privateKey: string, userSiteUrl: string) => {
    try {
        await transporter.verify();
        const mailOptions = {
            from: process.env.MANAGER_GMAIL,
            to: toEmail,
            subject: '🎉 Your NFT Purchase Confirmation - Next Steps Inside!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin: 0; font-size: 24px;">NFT Purchase Confirmation</h1>
                            <p style="color: #666; margin: 10px 0 20px; font-size: 16px;">Thank you for your purchase</p>
                            <a href="https://www.hubsai.io/" style="display: inline-block; text-decoration: none; font-size: 16px; padding: 10px 20px; border-radius: 4px; background-color: #357abd; color: white;">Visit HubsAI</a>
                        </div>
                        
                        <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin: 0 0 20px; font-size: 20px;">Transaction Details</h2>
                            <p style="color: #666; margin: 0 0 20px;">Your NFT purchase has been successfully completed. You can view your NFT using the link below:</p>
                            <p style="margin: 0;"><a href="${content}" style="color: #357abd; text-decoration: none;">View your NFT</a></p>
                        </div>

                        <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin: 0 0 20px; font-size: 20px;">Wallet Information</h2>
                            <p style="color: #666; margin: 0 0 10px;">Your wallet address:</p>
                            <p style="color: #333; background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; margin: 0;">${walletAddress}</p>
                        </div>

                        <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin: 0 0 20px; font-size: 20px;">Important Security Information</h2>
                            <ul style="color: #666; padding-left: 20px; margin: 0;">
                                <li style="margin: 10px 0;">Never share your private key with anyone</li>
                                <li style="margin: 10px 0;">Store your private key securely using a password manager</li>
                                <li style="margin: 10px 0;">Consider using a hardware wallet for additional security</li>
                                <li style="margin: 10px 0;">Enable two-factor authentication on your accounts</li>
                            </ul>
                        </div>

                        <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin: 0 0 20px; font-size: 20px;">Viewing Your NFT</h2>
                            <ol style="color: #666; padding-left: 20px; margin: 0;">
                                <li style="margin: 10px 0;">
                                    Download Phantom Wallet from <a href="https://phantom.app/" style="color: #357abd; text-decoration: none;">phantom.app</a>
                                </li>
                                <li style="margin: 10px 0;">
                                    Create a new wallet or import using your private key
                                </li>
                                <li style="margin: 10px 0;">
                                    Your NFT will appear in the "Collectibles" section
                                </li>
                            </ol>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 14px; margin: 0 0 10px;">For support inquiries, please contact:</p>
                            <p style="color: #357abd; font-size: 14px; margin: 0;">support@hubsai.io</p>
                        </div>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('4️⃣ Email sent successfully:', toEmail);
    } catch (error: any) {
        console.error('❌ Failed to send email. Detailed error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });

        // Check for specific error types
        if (error.code === 'ETIMEDOUT') {
            throw new Error('Connection timed out. Please check your internet connection and firewall settings.');
        } else if (error.code === 'EAUTH') {
            throw new Error('Authentication failed. Please check your Gmail credentials and make sure you\'re using an App Password.');
        } else if (error.code === 'ESOCKET') {
            throw new Error('Socket error. Please check your network connection and firewall settings.');
        }

        throw new Error(`Email sending failed: ${error.message}`);
    }
}
