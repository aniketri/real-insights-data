import { NextRequest, NextResponse } from 'next/server';
import { resend } from '../../../lib/mailer';
import { OtpEmail } from '../../../components/emails/otp-email';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { email } = await req.json();
    const testEmail = email || 'aniket@realinsightsdata.com';
    const testOtp = '123456';

    if (!resend) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        duration: Date.now() - startTime
      }, { status: 500 });
    }

    console.log('Starting email send test...');
    
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@realinsights.com',
      to: testEmail,
      subject: 'Test Email - Real Insights',
      react: OtpEmail({ otp: testOtp }),
    });

    const duration = Date.now() - startTime;

    console.log('Email send result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: result.data?.id,
      duration,
      to: testEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('Email send error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 