import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { type AuthOptions } from 'next-auth';

/**
 * EMERGENCY AUTH CONFIG - Simple OAuth without database
 * 
 * This works around Prisma engine issues by using JWT sessions only.
 * Users can sign in immediately while we fix the database issue.
 * 
 * To use: Replace import in [...nextauth]/route.ts
 * import { authOptions } from '@/lib/auth-simple';
 */
export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
    }),
  ],
  session: {
    strategy: 'jwt', // Pure JWT, no database required
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 Simple OAuth signIn:', { 
        provider: account?.provider, 
        email: user.email 
      });
      
      // Allow all OAuth sign-ins without database operations
      if (account?.provider !== 'credentials') {
        return true;
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Store user info in JWT token (no database needed)
        token.accessToken = account.access_token;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        // Default values for compatibility
        token.organizationId = 'temp-org';
        token.role = 'MEMBER';
      }
      return token;
    },
    async session({ session, token }) {
      // Build session from JWT token
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.image = token.image as string;
      session.accessToken = token.accessToken as string;
      (session.user as any).organizationId = token.organizationId as string;
      (session.user as any).role = token.role as string;
      
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
}; 