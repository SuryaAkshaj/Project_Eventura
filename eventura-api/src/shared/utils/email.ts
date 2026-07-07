import { Resend } from 'resend';
import { env } from '@config/env';

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Eventura <onboarding@resend.dev>';

export async function sendOTPEmail(to: string, otp: string, firstName: string): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Your Eventura verification code',
    html: `
      <div style="font-family: 'Public Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #2E3192; font-size: 24px; margin-bottom: 8px;">Eventura</h1>
        <p style="color: #374151; font-size: 16px;">Hi ${firstName},</p>
        <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
        <div style="background: #EEF2FF; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 48px; font-weight: 800; color: #2E3192; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px;">Eventura — Enterprise Event Management</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, otp: string, firstName: string): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your Eventura password',
    html: `
      <div style="font-family: 'Public Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #2E3192; font-size: 24px; margin-bottom: 8px;">Eventura</h1>
        <p style="color: #374151; font-size: 16px;">Hi ${firstName},</p>
        <p style="color: #374151; font-size: 16px;">Your password reset code is:</p>
        <div style="background: #EEF2FF; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 48px; font-weight: 800; color: #2E3192; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code expires in 15 minutes.</p>
        <p style="color: #9CA3AF; font-size: 12px;">Eventura — Enterprise Event Management</p>
      </div>
    `,
  });
}

export async function sendEventConfirmationEmail(
  to: string,
  firstName: string,
  eventTitle: string,
  eventDate: string,
  venue: string,
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You're registered for ${eventTitle}`,
    html: `
      <div style="font-family: 'Public Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #2E3192; font-size: 24px; margin-bottom: 8px;">Eventura</h1>
        <p style="color: #374151; font-size: 16px;">Hi ${firstName},</p>
        <p style="color: #374151; font-size: 16px;">You're registered for:</p>
        <div style="background: #EEF2FF; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #2E3192; margin: 0 0 8px;">${eventTitle}</h2>
          <p style="color: #374151; margin: 0 0 4px;">📅 ${eventDate}</p>
          <p style="color: #374151; margin: 0;">📍 ${venue || 'Online'}</p>
        </div>
        <p style="color: #6B7280; font-size: 14px;">Your QR ticket is available in the Eventura app under My Tickets.</p>
        <p style="color: #9CA3AF; font-size: 12px;">Eventura — Enterprise Event Management</p>
      </div>
    `,
  });
}
