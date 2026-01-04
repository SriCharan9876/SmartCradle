import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

// export async function sendEmail(to, subject, html) {
//     // const transporter = nodemailer.createTransport({
//     //     host: "smtp.gmail.com",
//     //     port: 587,
//     //     secure: false,
//     //     auth: {
//     //         user: process.env.EMAIL_USER,
//     //         pass: process.env.EMAIL_PASS,
//     //     },
//     // });

//     try {
//         const info = await transporter.sendMail({
//             from: `"Smart Cradle" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             html,
//         });
//         return info;
//     } catch (error) {
//         throw error;
//     }
// }

export async function sendEmail(to, subject, html) {
    const payload = {
        mail: to,
        title: subject,
        body: html
    }
    const response = await axios.post(
        process.env.N8N_URL,
        payload,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}