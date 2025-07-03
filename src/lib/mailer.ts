import { Resend } from 'resend';

// Only initialize Resend if API key is available (not during build)
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null; 