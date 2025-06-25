import prisma from '@repo/db';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession, type AuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  // Manual handling for all providers - no adapter
  adapter: undefined,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common', // Use 'common' for multi-tenant
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            organization: true,
          },
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          organizationId: user.organizationId,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered:', { provider: account?.provider, email: user.email });
      
      // Handle OAuth providers manually
      if (account?.provider !== 'credentials' && user.email) {
        try {
          console.log('Processing OAuth user:', user.email);
          
          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          console.log('Existing user found:', !!existingUser);

          if (!existingUser) {
            console.log('Creating new organization and user...');
            
            // Create organization first for new OAuth users
            const organization = await prisma.organization.create({
              data: {
                name: `${user.name || user.email}'s Organization`,
              },
            });

            console.log('Organization created:', organization.id);

            // Create the user with organization - new users get MEMBER role by default
            existingUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                image: user.image,
                emailVerified: new Date(), // OAuth users are pre-verified
                organizationId: organization.id,
                role: 'MEMBER', // Default role for new users
                permissions: ['READ_ALL'], // Basic permissions for new users
              },
            });

            console.log('User created:', existingUser.id);
            
            // Mark as needing profile completion for new OAuth users
            (user as any).needsProfileCompletion = true;
          } else if (!existingUser.organizationId) {
            console.log('Adding organization to existing user...');
            
            // Existing user without organization - create one
            const organization = await prisma.organization.create({
              data: {
                name: `${user.name || user.email}'s Organization`,
              },
            });

            existingUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                organizationId: organization.id,
                emailVerified: existingUser.emailVerified || new Date(),
              },
            });

            console.log('User updated with organization:', existingUser.id);
          }

          // Update the user object with database values
          user.id = existingUser.id;
          (user as any).organizationId = existingUser.organizationId;
          (user as any).role = existingUser.role;
          
          // Simple check for profile completion - can be enhanced later
          if (!existingUser.name || existingUser.name.includes('@')) {
            (user as any).needsProfileCompletion = true;
          }
          
          console.log('OAuth sign-in successful for:', user.email);
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        token.organizationId = (user as any).organizationId;
        token.role = (user as any).role;
        token.needsProfileCompletion = (user as any).needsProfileCompletion;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      (session.user as any).organizationId = token.organizationId as string;
      (session.user as any).role = token.role as string;
      (session.user as any).needsProfileCompletion = token.needsProfileCompletion as boolean;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const auth = () => getServerSession(authOptions); 