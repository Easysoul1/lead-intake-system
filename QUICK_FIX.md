# Quick Fix for 405 Error

## Step 1: Deploy the New Files

The health endpoint and fixes need to be deployed. Run these commands:

```bash
git add .
git commit -m "Add health endpoint and improve error handling for Vercel deployment"
git push
```

Wait for Vercel to finish deploying (check your Vercel dashboard).

## Step 2: Check if DATABASE_URL is Set

**This is the most likely cause of your 405 error!**

1. Go to: https://vercel.com/dashboard
2. Select your project: `lead-intake-system`
3. Go to **Settings** → **Environment Variables**
4. Check if `DATABASE_URL` exists
5. If not, add it:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environments**: Select all (Production, Preview, Development)
   - Click **Save**

## Step 3: After Deployment, Check Health Endpoint

Once deployed, visit:
```
https://lead-intake-system.vercel.app/api/health
```

This will show you exactly what's wrong.

## Step 4: Check Vercel Function Logs

If health endpoint still shows issues:

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments**
3. Click the latest deployment
4. Click **Functions** tab
5. Look for `/api/leads` function
6. Check the **Logs** for errors

Common errors you'll see:
- `Environment variable not found: DATABASE_URL` ← **This is your issue!**
- `Can't reach database server`
- `P1001: Can't reach database server`

## Quick Test Without Health Endpoint

You can also test the main endpoint directly. The improved error handling will now show you a clear error message if `DATABASE_URL` is missing.

Try submitting a lead again - you should now see a proper error message instead of 405.
