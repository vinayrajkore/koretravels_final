// mailer.js - Gmail SMTP Configuration
// Uses Gmail App Password from .env (EMAIL_USER + EMAIL_PASS)
// IMPORTANT: EMAIL_PASS must be a Gmail App Password (not your normal Gmail password)
// To create one: Google Account → Security → 2-Step Verification → App Passwords

require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,   // e.g. ranuh441@gmail.com
        pass: process.env.EMAIL_PASS    // 16-char Gmail App Password (no spaces)
    }
});

// Verify on startup so errors are obvious in the console
transporter.verify((error) => {
    if (error) {
        console.error("⚠️  MAILER ERROR — Emails will NOT be sent!");
        console.error("   Reason:", error.message);
        console.error("   Fix: Set EMAIL_USER and EMAIL_PASS (Gmail App Password) in backend/.env");
        console.error("   Guide: https://support.google.com/accounts/answer/185833");
    } else {
        console.log("✅ Mailer ready — using", process.env.EMAIL_USER);
    }
});

module.exports = transporter;
