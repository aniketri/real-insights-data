'use client';

import { useEffect } from 'react';

/**
 * KeepAlive Component - Prevents Render free tier from sleeping
 * 
 * Render free tier sleeps after 15 minutes of inactivity.
 * This component pings the API every 10 minutes to keep it awake.
 * 
 * Only active in production when ENABLE_KEEP_ALIVE is true
 */
export default function KeepAlive() {
  useEffect(() => {
    // Only run in production and when explicitly enabled
    if (process.env.NODE_ENV !== 'production') return;
    if (process.env.NEXT_PUBLIC_ENABLE_KEEP_ALIVE !== 'true') return;

    const keepAlive = setInterval(async () => {
      try {
        // Silent ping to health endpoint
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          console.warn('Keep-alive ping failed:', response.status);
        }
      } catch (error) {
        console.warn('Keep-alive ping error:', error);
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    // Cleanup on unmount
    return () => {
      clearInterval(keepAlive);
    };
  }, []);

  // This component renders nothing
  return null;
}

/**
 * Usage:
 * 
 * Add to your main layout:
 * ```tsx
 * import KeepAlive from '@/components/KeepAlive';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <KeepAlive />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * Environment variables needed:
 * - NEXT_PUBLIC_ENABLE_KEEP_ALIVE=true (for production)
 * - ENABLE_KEEP_ALIVE=true (for Render API)
 */ 