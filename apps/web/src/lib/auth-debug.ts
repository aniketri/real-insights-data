import prisma from '@repo/db';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { type AuthOptions } from 'next-auth';

/**
 * DEBUGGING VERSION OF AUTH CONFIG
 * 
 * Use this temporarily to isolate NextAuth issues.
 * This bypasses complex database operations in the signIn callback.
 * 
 * To use: Replace import in [...nextauth]/route.ts
 * import { authOptions } from '@/lib/auth-debug';
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
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 DEBUG SignIn callback:', { 
        provider: account?.provider, 
        email: user.email,
        environment: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL
      });
      
      // SIMPLIFIED: Just allow all OAuth sign-ins for debugging
      if (account?.provider !== 'credentials') {
        console.log('✅ DEBUG: Allowing OAuth sign-in without database operations');
        return true;
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('🔍 DEBUG JWT callback:', { 
        hasUser: !!user, 
        hasAccount: !!account,
        tokenSub: token.sub 
      });
      
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        // Skip database-dependent fields for debugging
        token.organizationId = 'debug-org';
        token.role = 'MEMBER';
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔍 DEBUG Session callback:', { 
        email: session.user?.email,
        tokenId: token.id 
      });
      
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      (session.user as any).organizationId = token.organizationId as string;
      (session.user as any).role = token.role as string;
      
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}; 