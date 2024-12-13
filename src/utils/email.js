import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/constants.js';
import { logger } from './logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: EMAIL_CONFIG.FROM,
        to: options.email,
        subject: options.subject,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      email: user.email,
      subject: 'Bienvenue à Fromagerie Alioui',
      html: `
        <h1>Bienvenue ${user.name}!</h1>
        <p>Nous sommes ravis de vous compter parmi nos clients.</p>
      `
    });
  }

  async sendPasswordResetEmail(user, resetUrl) {
    return this.sendEmail({
      email: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation du mot de passe</h1>
        <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });
  }

  async sendOrderConfirmation(user, order) {
    return this.sendEmail({
      email: user.email,
      subject: `Confirmation de commande #${order.orderNumber}`,
      html: `
        <h1>Merci pour votre commande!</h1>
        <p>Votre commande #${order.orderNumber} a été confirmée.</p>
      `
    });
  }
}

export const emailService = new EmailService();