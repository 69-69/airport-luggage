import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

type EmailRequestBody = {
    to: string;
    subject: string;
    text: string;
};

export async function POST(req: NextRequest) {
    try {
        const { to, subject, text } = await req.json() as EmailRequestBody;

        if (!to || !subject || !text) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        // Configure transporter (example: Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: "Gmail", // smtp.gmail.com
            auth: {
                user: 'devmail026@gmail.com', // your email process.env.EMAIL_USER
                pass: 'xpadoeylemcxgjjp', // app password process.env.EMAIL_PASS
            },
        });

        // Send the email
        await transporter.sendMail({
            from: 'devmail026@gmail.com', // process.env.EMAIL_USER
            to,
            subject,
            text,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: (err as Error).message });
    }
}
