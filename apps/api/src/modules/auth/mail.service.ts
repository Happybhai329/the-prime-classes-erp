import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = parseInt(this.configService.get<string>('SMTP_PORT', '587'), 10);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
      });
    } else {
      this.logger.warn('SMTP_HOST is not configured. Mail service will run in log-only mode.');
    }
  }

  async sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@primeclasses.in');
    
    this.logger.log(`[SMTP SIMULATOR] Sending Password Reset OTP: ${otp} to ${to}`);

    if (!this.transporter) {
      this.logger.log('SMTP transporter not configured. Skipping sending email.');
      return;
    }

    const mailOptions = {
      from,
      to,
      subject: 'Password Reset OTP - Prime ERP',
      text: `Your password reset OTP is: ${otp}. It is valid for 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Request</h2>
          <p>You requested a password reset for your Prime ERP account.</p>
          <p>Please use the following One-Time Password (OTP) to reset your password:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; color: #1f2937; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
    }
  }
}
