import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

// betterAuth
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },

    emailVerification: {
        sendOnSignUp: true,
        // auto sign in after verification
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            // console.log({ user, url, token });
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`

                const info = await transporter.sendMail({
                    from: '"PH Module 23" <prismablog@ph.email>',
                    to: user.email,
                    subject: "Please verify your email",
                    // text: "Hello world?", // Plain-text version of the message
                    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Prisma Blog PH</h1>
                </div>
                <div style="padding: 30px; color: #333; line-height: 1.6;">
                    <p>Hello ${user.name},</p>
                    <p>Thank you for signing up! To get started, please confirm your email address by clicking the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Verify Email Address
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">
                        If the button above doesn't work, copy and paste this link into your browser:
                        <br />
                        <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                    © ${new Date().getFullYear()} PH Module 23. All rights reserved.
                </div>
            </div>`, // HTML version of the message
                });

                console.log("Message sent:", info.messageId);
            } catch (err) {
                console.log(err);
                throw err;
            }
        },

        socialProviders: {
            google: {
                accessType: "offline",
                prompt: "select_account consent",
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
        },
    },
});