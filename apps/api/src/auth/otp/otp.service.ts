import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Resend } from 'resend';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  constructor(private readonly prisma: PrismaService) {}

  async generateAndSendOtp(email: string): Promise<void> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    await this.prisma.oneTimePassword.create({
      data: {
        email,
        token: otp, // In a real app, you should hash this token
        expires,
      },
    });

    try {
      await this.resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: 'Your OTP for Real Insights',
        html: `<p>Your One-Time Password is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // In a real app, you would have more robust error handling
    }
  }

  async verifyOtp(email: string, token: string): Promise<boolean> {
    const otpRecord = await this.prisma.oneTimePassword.findFirst({
      where: {
        email,
        token,
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Delete the OTP so it can't be used again
    await this.prisma.oneTimePassword.delete({
      where: { id: otpRecord.id },
    });

    if (otpRecord.expires < new Date()) {
      return false; // OTP has expired
    }

    return true;
  }
}
