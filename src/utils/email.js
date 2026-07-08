import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { gmailContent } from "./emailTemplate.js";

dotenv.config();

const secret_key = process.env.JWT_SECRET;

export const generateverificationToken = (email) => {
    return jwt.sign(
        { email },
        secret_key,
        { expiresIn: "1d" }
    );
};

export const sendVerificationEmail = async (
    recipientEmail,
    verificationToken,
    username
) => {

    try {

        const transporterConfig = process.env.EMAIL_HOST
            ? {
                  host: process.env.EMAIL_HOST,
                  port: Number(process.env.EMAIL_PORT) || 587,
                  secure: process.env.EMAIL_SECURE === 'true',
                  auth: {
                      user: process.env.EMAIL,
                      pass: process.env.PASSWORD,
                  },
              }
            : {
                  service: 'gmail',
                  auth: {
                      user: process.env.EMAIL,
                      pass: process.env.PASSWORD,
                  },
              };

        const transporter = nodemailer.createTransport(transporterConfig);
        await transporter.verify();

        const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '') || '';
        const apiBaseUrl = backendUrl.endsWith('/api/v1')
            ? backendUrl
            : `${backendUrl}/api/v1`;

        const verifyUrl = `${apiBaseUrl}/users/verifyemail/${encodeURIComponent(verificationToken)}`;

        console.log("====================================");
        console.log("Verification Link:");
        console.log(verifyUrl);
        console.log("====================================");

        const emailContent = gmailContent(
            verifyUrl,
            username
        );

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: recipientEmail,
            subject: "Verify Your Email",
            html: emailContent,
        });

        console.log("Verification email sent successfully.");

    } catch (err) {
        console.error("Failed to send verification email:", err);
        throw err;
    }

};