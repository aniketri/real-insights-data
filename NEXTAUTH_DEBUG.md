# NextAuth "Access Denied" Debug Guide

## 🚨 Common Causes of "Access Denied" Error

The "Access Denied" error typically occurs due to:

1. **Environment Variables Issues** (Most Common)
2. **OAuth Callback URL Mismatch** 
3. **Database Connection Problems**
4. **NEXTAUTH_URL Configuration**
5. **SignIn Callback Errors**

## 🔍 Step-by-Step Debugging

### 1. Check Environment Variables

**Vercel Environment Variables (CRITICAL):**
```bash
# Required for NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-here

# Database
DATABASE_URL=mongodb+srv://...

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth  
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
```

**❌ Common Mistakes:**
- Missing `NEXTAUTH_URL` in production
- Wrong `NEXTAUTH_URL` (doesn't match your domain)
- Missing or incorrect OAuth client secrets
- Database URL not accessible from Vercel

### 2. OAuth Provider Configuration

**Google Cloud Console:**
```
Authorized JavaScript origins:
- https://your-app.vercel.app
- http://localhost:3000 (for development)

Authorized redirect URIs:
- https://your-app.vercel.app/api/auth/callback/google
- http://localhost:3000/api/auth/callback/google
```

**Microsoft Azure Portal:**
```
Redirect URIs (Web):
- https://your-app.vercel.app/api/auth/callback/azure-ad
- http://localhost:3000/api/auth/callback/azure-ad

Supported account types:
- Accounts in any organizational directory (Any Azure AD directory - Multitenant)
```

### 3. Database Connection Test

The error might be happening in the `signIn` callback when trying to create/update users.

**Common Database Issues:**
- MongoDB connection string not working from Vercel
- IP whitelist not including Vercel's IPs (use 0.0.0.0/0 for testing)
- Database user permissions insufficient

## 🛠️ Quick Fixes

### Fix 1: Add Better Error Logging

Update your auth configuration to see exactly where it's failing:

```typescript
// apps/web/src/lib/auth.ts - Enhanced logging
callbacks: {
  async signIn({ user, account, profile }) {
    console.log('🔐 SignIn callback:', { 
      provider: account?.provider, 
      email: user.email,
      userId: user.id 
    });
    
    if (account?.provider !== 'credentials' && user.email) {
      try {
        // ... existing code with more logging
        console.log('✅ OAuth sign-in successful');
        return true;
      } catch (error) {
        console.error('❌ OAuth sign-in failed:', error);
        return false; // This causes "Access Denied"
      }
    }
    return true;
  }
}
```

### Fix 2: Simplify SignIn Callback (Temporary)

For debugging, temporarily simplify the signIn callback:

```typescript
async signIn({ user, account, profile }) {
  console.log('SignIn attempt:', { provider: account?.provider, email: user.email });
  
  // Temporarily allow all OAuth sign-ins to isolate the issue
  if (account?.provider !== 'credentials') {
    console.log('Allowing OAuth sign-in for debugging');
    return true;
  }
  
  return true;
}
```

### Fix 3: Check NEXTAUTH_URL

Most common issue - make sure `NEXTAUTH_URL` is set correctly in Vercel:

```bash
# In Vercel dashboard, add this environment variable:
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### Fix 4: Database Connection Test

Add a simple test endpoint to verify database connectivity:

```typescript
// apps/web/src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import db from '@repo/db';

export async function GET() {
  try {
    const userCount = await db.user.count();
    return NextResponse.json({ 
      status: 'success', 
      userCount,
      message: 'Database connection working' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      error: error.message,
      message: 'Database connection failed' 
    }, { status: 500 });
  }
}
```

## 🔧 Immediate Action Plan

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Look for errors in the `/api/auth/[...nextauth]` function logs
3. Check for database connection errors

### Step 2: Verify Environment Variables
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all required variables are set for "Production"
3. Pay special attention to `NEXTAUTH_URL`

### Step 3: Test Database Connection
1. Deploy the test endpoint above
2. Visit `https://your-app.vercel.app/api/test-db`
3. Verify database is accessible

### Step 4: Check OAuth Provider Settings
1. Google Cloud Console → Your Project → Credentials
2. Verify redirect URIs match exactly
3. Same for Microsoft Azure Portal

## 🚨 Emergency Fix (If Users Are Waiting)

If you need an immediate fix while debugging:

```typescript
// Temporary bypass in auth.ts
async signIn({ user, account, profile }) {
  // TEMPORARY: Allow all OAuth for debugging
  if (account?.provider !== 'credentials') {
    console.log('TEMP: Allowing OAuth sign-in');
    return true;
  }
  return true;
}
```

This will let users sign in while you fix the underlying issue.

## 📊 Debug Checklist

- [ ] `NEXTAUTH_URL` set correctly in Vercel
- [ ] `NEXTAUTH_SECRET` set in Vercel  
- [ ] `DATABASE_URL` working from Vercel
- [ ] OAuth redirect URIs match exactly
- [ ] MongoDB IP whitelist includes Vercel
- [ ] Function logs show specific error
- [ ] Database test endpoint works
- [ ] OAuth provider credentials valid

## 🎯 Most Likely Solutions

**90% of cases:** Missing or incorrect `NEXTAUTH_URL` in Vercel
**8% of cases:** OAuth redirect URI mismatch
**2% of cases:** Database connection issues

Check `NEXTAUTH_URL` first! 