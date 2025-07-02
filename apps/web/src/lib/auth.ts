import prisma from '@repo/db';
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
          console.log('🔑 Attempting credentials authentication for:', credentials.email);
          
          await prisma.$connect();
          console.log('✅ Database connection established for credentials auth');

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null;
          }

          if (!user.passwordHash) {
            console.log('❌ User has no password hash - likely OAuth-only user');
            return null;
          }

          if (!user.emailVerified) {
            console.log('❌ Email not verified for user:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email);
            return null;
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          console.log('✅ Credentials authentication successful for:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('❌ Database error in credentials auth:', error);
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
      console.log('🔐 SignIn callback triggered:', { 
        provider: account?.provider, 
        email: user.email 
      });
      
      // For OAuth providers, ensure user has organization and proper role setup
      if (account?.provider !== 'credentials' && user.email) {
        try {
          console.log('🔍 Processing OAuth user:', user.email);
          
          await prisma.$connect();
          console.log('✅ Database connection established');
          
          // The adapter creates a basic user, we need to enhance it with organization
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (dbUser && !dbUser.organizationId) {
            console.log('Adding organization to OAuth user...');
            
            // Create organization for OAuth user
            const organization = await prisma.organization.create({
              data: {
                name: `${user.name || user.email}'s Organization`,
                subscriptionStatus: 'TRIAL',
                subscriptionTier: 'BASIC',
              },
            });

            // Update user with organization and ensure proper setup
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                organizationId: organization.id,
                emailVerified: new Date(), // OAuth users are pre-verified (no OTP needed)
                role: 'MEMBER', // Default role
                permissions: ['READ_ALL'], // Basic permissions
                isActive: true,
                lastLoginAt: new Date(),
              },
            });

            console.log('User updated with organization:', dbUser.id);
          } else if (dbUser) {
            // Update existing user's last login
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                lastLoginAt: new Date(),
                isActive: true,
              },
            });
          }
          
          console.log('✅ OAuth sign-in successful for:', user.email);
        } catch (error) {
          console.error('❌ Error in OAuth signIn callback:', error);
          // Allow sign-in to continue even if there are database issues
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // For both OAuth and credentials, get fresh user data for JWT
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (dbUser) {
            token.organizationId = dbUser.organizationId;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user data for JWT:', error);
        }
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
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎉 User signed in:', {
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
    async createUser({ user }) {
      console.log('👤 New user created by adapter:', user.email);
    },
  },
};

export const auth = () => getServerSession(authOptions); 