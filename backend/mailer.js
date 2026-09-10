// mailer.js - Brevo HTTP API Configuration
// Replaces SMTP to bypass Render's free tier port blocking
// Requires BREVO_API_KEY and EMAIL_USER (your verified sender email) in .env

require("dotenv").config();
const axios = require("axios");

// We export a dummy "transporter" that mimics nodemailer's sendMail function
// This way we don't have to rewrite any of the email code in database.js!
const transporter = {
    sendMail: async (options) => {
        try {
            const senderEmail = process.env.EMAIL_USER || "noreply@koretravels.com";
            
            const response = await axios.post(
                "https://api.brevo.com/v3/smtp/email",
                {
                    sender: { name: "Kore Travels Booking", email: senderEmail },
                    to: [{ email: options.to }],
                    subject: options.subject,
                    htmlContent: options.html
                },
                {
                    headers: {
                        "api-key": process.env.BREVO_API_KEY,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }
            );

            console.log("✅ Email sent successfully via Brevo:", response.data.messageId);
            return response.data;
        } catch (err) {
            console.error("❌ Failed to send email via Brevo:", err.response?.data || err.message);
            throw err;
        }
    }
};

module.exports = transporter;
