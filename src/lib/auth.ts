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
      // For OAuth providers, defer all database operations
      if (account?.provider !== 'credentials') {
        // Just return true - user creation happens via Prisma adapter
        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Only add user data on initial sign-in, don't query database
      if (user) {
        token.id = user.id;
        // Set defaults - will be updated during onboarding
        token.organizationId = null;
        token.role = 'MEMBER';
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      (session.user as any).organizationId = token.organizationId as string;
      (session.user as any).role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const auth = () => getServerSession(authOptions); 