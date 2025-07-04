import NextAuth from 'next-auth';
// Switch back to full database integration now that DB is reset
import { authOptions } from '../../../../lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Force dynamic rendering for auth routes
export const dynamic = 'force-dynamic'; 