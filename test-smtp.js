import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

console.log("SMTP_HOST:", env.SMTP_HOST);
console.log("SMTP_PORT:", env.SMTP_PORT);
console.log("SMTP_USER:", env.SMTP_USER);
console.log("SMTP_PASS length:", env.SMTP_PASS?.length);

const port = parseInt(env.SMTP_PORT || '465', 10);
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: port,
  secure: env.SMTP_SECURE === 'true' || port === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

console.log("Testing SMTP connection...");
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
    process.exit(1);
  } else {
    console.log("SMTP Server is ready to take our messages!");
    
    transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: env.SMTP_USER,
      subject: 'Test Email from Printigly',
      text: 'This is a test email from Antigravity SMTP verifier.'
    }).then(info => {
      console.log("Email sent successfully!", info.messageId);
      process.exit(0);
    }).catch(err => {
      console.error("Send mail error:", err);
      process.exit(1);
    });
  }
});
