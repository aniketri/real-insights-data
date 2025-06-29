/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/db'],
  
  // Skip database connection during build
  env: {
    SKIP_DB_CONNECTION: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ? 'true' : 'false',
  },
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle Prisma client in webpack
    if (isServer) {
      config.externals.push('_http_common');
    }
    
    return config;
  },
};

export default nextConfig; 