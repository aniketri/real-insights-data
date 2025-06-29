import NextAuth from 'next-auth';
// TEMPORARY: Use debug config to isolate issue
import { authOptions } from '@/lib/auth-debug';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 