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
      // For OAuth providers, optimize user creation/update
      if (account?.provider !== 'credentials' && user.email) {
        try {
          // Use a single transaction to handle all OAuth user setup
          await prisma.$transaction(async (tx: any) => {
            // Check if user exists
            let existingUser = await tx.user.findUnique({
              where: { email: user.email! },
              select: { 
                id: true, 
                organizationId: true, 
                role: true, 
                emailVerified: true,
                permissions: true
              }
            });

            if (!existingUser) {
              // Create organization and user in single transaction
              const organization = await tx.organization.create({
                data: {
                  name: `${user.name || user.email}'s Organization`,
                  subscriptionStatus: 'TRIAL',
                  subscriptionTier: 'BASIC',
                },
              });

              existingUser = await tx.user.create({
                data: {
                  email: user.email!,
                  name: user.name || user.email!.split('@')[0],
                  image: user.image,
                  emailVerified: new Date(),
                  organizationId: organization.id,
                  role: 'MEMBER',
                  permissions: ['READ_ALL'],
                  isActive: true,
                  lastLoginAt: new Date(),
                },
              });
            } else if (!existingUser.organizationId) {
              // Create organization for existing user
              const organization = await tx.organization.create({
                data: {
                  name: `${user.name || user.email}'s Organization`,
                  subscriptionStatus: 'TRIAL',
                  subscriptionTier: 'BASIC',
                },
              });

              existingUser = await tx.user.update({
                where: { id: existingUser.id },
                data: {
                  organizationId: organization.id,
                  emailVerified: existingUser.emailVerified || new Date(),
                  role: existingUser.role || 'MEMBER',
                  permissions: existingUser.permissions.length > 0 ? existingUser.permissions : ['READ_ALL'],
                  isActive: true,
                  lastLoginAt: new Date(),
                },
              });
            } else {
              // Just update last login for existing complete users
              await tx.user.update({
                where: { id: existingUser.id },
                data: {
                  lastLoginAt: new Date(),
                  isActive: true,
                },
              });
            }

            // Update user object for JWT
            user.id = existingUser.id;
            (user as any).organizationId = existingUser.organizationId;
            (user as any).role = existingUser.role;
          }, {
            timeout: 8000, // 8 second timeout for OAuth transaction
          });
        } catch (error) {
          console.error('Error in OAuth signIn callback:', error);
          // Don't block sign-in for database issues - user can complete setup later
          return true;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Optimize JWT callback - only fetch if needed
      if (user?.email && !token.organizationId) {
        try {
          // Use timeout wrapper for JWT queries
          const dbUser = await Promise.race([
            prisma.user.findUnique({
              where: { email: user.email },
              select: { organizationId: true, role: true }
            }),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('JWT query timeout')), 3000)
            )
          ]);
          
          if (dbUser) {
            token.organizationId = dbUser.organizationId;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error fetching user data for JWT:', error);
          // Continue without organization data - user can re-login
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
};

export const auth = () => getServerSession(authOptions); 