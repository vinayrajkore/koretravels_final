// mailer.js - Resend HTTP API Configuration
// Replaces SMTP to bypass Render's free tier port blocking
// Requires RESEND_API_KEY in .env

require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// We export a dummy "transporter" that mimics nodemailer's sendMail function
// This way we don't have to rewrite any of the email code in database.js!
const transporter = {
    sendMail: async (options) => {
        try {
            // Note: If you haven't verified a domain on Resend, you MUST use "onboarding@resend.dev"
            // as the 'from' address, and you can only send emails to your OWN registered email address.
            const { data, error } = await resend.emails.send({
                from: "Kore Travels <onboarding@resend.dev>", 
                to: options.to,
                subject: options.subject,
                html: options.html
            });

            if (error) {
                console.error("❌ Resend API Error:", error.message);
                throw error;
            }

            console.log("✅ Email sent via Resend:", data.id);
            return data;
        } catch (err) {
            console.error("❌ Failed to send email:", err.message);
            throw err;
        }
    }
};

module.exports = transporter;
