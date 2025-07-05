import prisma from '../../packages/db';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession, type AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  // Use Prisma adapter for OAuth to automatically store in accounts/sessions tables
  adapter: PrismaAdapter(prisma),
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
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash || !user.emailVerified) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login in background (don't await to speed up auth)
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }).catch(console.error);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Database error in credentials auth:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback:', { 
        provider: account?.provider, 
        userEmail: user?.email,
        userId: user?.id 
      });

      // For OAuth providers, the PrismaAdapter handles user creation
      if (account?.provider !== 'credentials') {
        console.log('✅ OAuth sign-in successful for:', user?.email);
        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      console.log('🎫 JWT callback:', { 
        hasUser: !!user, 
        hasAccount: !!account,
        tokenSub: token.sub 
      });

      // Only add user data on initial sign-in
      if (user) {
        token.id = user.id;
        // Set defaults - will be updated during onboarding
        token.organizationId = null;
        token.role = 'MEMBER';
        console.log('✅ JWT token updated with user data');
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('🔍 Session callback:', { 
        sessionUserEmail: session.user?.email,
        tokenSub: token.sub 
      });

      session.user.id = token.sub as string;
      (session.user as any).organizationId = token.organizationId as string;
      (session.user as any).role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Add debug logging in development
  debug: process.env.NODE_ENV === 'development',
};

export const auth = () => getServerSession(authOptions); 