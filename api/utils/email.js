import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import nodemailer from 'nodemailer';

const sesClient = new SESv2Client({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand },
  });

  const result = await transporter.sendMail({
    from: `Status Scout <${process.env.SENDER_EMAIL}>`,
    to: `${to} <${to}>`,
    subject,
    html,
  });

  return result;
};

export default sendEmail;
