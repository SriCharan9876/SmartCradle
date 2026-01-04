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
    payload = {
        mail: to,
        title: subject,
        body: html
    }
    const response = await axios.post(
        "https://ramuabsn.app.n8n.cloud/webhook/39c231f8-d190-4449-96c9-c80330adb5a9",
        payload,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}