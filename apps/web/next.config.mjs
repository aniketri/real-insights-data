import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: '../../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/db'],
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./node_modules/.prisma/client/**/*'],
    },
    ...(process.env.NODE_ENV === 'production' && {
      outputFileTracingExcludes: {
        '*': [
          'node_modules/@swc/core-linux-x64-gnu',
          'node_modules/@swc/core-linux-x64-musl',
          'node_modules/esbuild-linux-64',
        ],
      },
    })
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },

  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // DATABASE_URL: Removed from here to prevent build-time connection
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    API_URL: process.env.API_URL,
    // Build-time flag to skip database operations
    SKIP_DB_DURING_BUILD: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ? 'true' : 'false',
  },
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig; 