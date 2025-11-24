# Vercel Deployment Setup Guide

## Environment Variables Setup

Your app needs environment variables to work correctly on Vercel. Here's how to set them:

### For the Frontend (Client)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your **client/frontend** project (pewpew-fr or similar)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_SOCKET_URL=https://pewpew-73so.onrender.com
VITE_API_URL=https://pewpew-73so.onrender.com/api
```

5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on the latest deployment
8. Click **Redeploy** → **Redeploy**

### For the Backend (Server)

Your backend is on Render.com, not Vercel. Make sure these are set in Render:

1. Go to Render dashboard
2. Select your service
3. Go to **Environment** tab
4. Ensure these are set:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - Should be set automatically by Render

## Quick Fix Summary

✅ Fixed double slash issue in API URLs  
✅ Updated fallback URLs in Login and Register pages  
✅ Created vercel.json for client-side routing  

## What Was Changed

- `Login.jsx` - Updated API URL fallback
- `Register.jsx` - Updated API URL fallback
- Created `vercel.json` for proper routing

## Next Steps

1. Set environment variables on Vercel (see above)
2. Redeploy on Vercel
3. Your app should work correctly!

## If You Still Have Issues

The app will work locally and should work on Vercel once environment variables are set. If you want to revert to before deployment attempts, you can run:

```bash
git log --oneline
# Find the commit from this morning
git reset --hard <commit-hash>
git push -f origin main
```

But I recommend trying the environment variable fix first!
