import NextAuth from 'next-auth';
// EMERGENCY: Use simple auth to bypass database issues during deployment
import { authOptions } from '@/lib/auth-simple';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 