import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,       // Your Gmail
    pass: process.env.EMAIL_PASS   // App password
  }
});

export async function sendMail({ to, subject, message }) {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html: `<p>${message}</p>`
  };

  return transporter.sendMail(mailOptions);
}
