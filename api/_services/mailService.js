import nodemailer from 'nodemailer';

export function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    });
}

function getSender(type) {
    switch (type) {
        case 'AUTH':
            return process.env.MAIL_FROM_AUTH || process.env.SMTP_FROM || 'no-reply@visuallink.com';
        case 'ORDER':
            return process.env.MAIL_FROM_ORDER || process.env.SMTP_FROM || 'auto-confirm@visuallink.com';
        case 'ADMIN':
            return process.env.ADMIN_EMAIL || process.env.SMTP_FROM || 'admin@visuallink.com';
        default:
            return process.env.SMTP_FROM || 'no-reply@visuallink.com';
    }
}

export const mailService = {
    async sendAuthOTP(toEmail, otpCode) {
        const transporter = getTransporter();
        if (!transporter) throw new Error('SMTP not configured');

        const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your Visual Blink verification code</h2>
        <p>Please use the following 6-digit code to verify your login:</p>
        <h1 style="color: #025afc; letter-spacing: 2px;">${otpCode}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please securely ignore this email.</p>
      </div>
    `;

        return transporter.sendMail({
            from: getSender('AUTH'),
            to: toEmail,
            subject: 'Your Visual Blink verification code',
            html
        });
    },

    async sendOrderConfirmation(toEmail, orderId, htmlContent) {
        const transporter = getTransporter();
        if (!transporter) throw new Error('SMTP not configured');

        return transporter.sendMail({
            from: getSender('ORDER'),
            to: toEmail,
            subject: `Order Confirmed — Visual Blink #${orderId}`,
            html: htmlContent
        });
    },

    async sendAdminNotification(subject, htmlContent) {
        const transporter = getTransporter();
        if (!transporter) throw new Error('SMTP not configured');

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) return;

        return transporter.sendMail({
            from: getSender('ORDER'), // or ADMIN depending on what mail server allows
            to: adminEmail,
            subject,
            html: htmlContent
        });
    }
};
