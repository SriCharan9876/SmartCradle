import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

export async function sendEmail(to, subject, html) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        family: 4, // Force IPv4
    });

    try {
        const info = await transporter.sendMail({
            from: `"Smart Cradle" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        throw error;
    }
}
