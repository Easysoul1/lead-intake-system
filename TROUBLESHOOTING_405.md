# Troubleshooting 405 Error on Vercel

## The Problem

You're seeing a **405 Method Not Allowed** error, but the actual issue is a **500 Internal Server Error** (see `x-next-error-status: 500` in the response headers). This happens when the API route crashes before it can handle the request.

## Most Common Causes

### 1. DATABASE_URL Not Set in Vercel (Most Likely)

**Symptoms:**
- 405 error on POST requests
- `x-next-error-status: 500` in response headers
- Works locally but not on Vercel

**Solution:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `DATABASE_URL` with your PostgreSQL connection string
4. Make sure to add it for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. **Redeploy** your application (Vercel will automatically redeploy when you add env vars, or trigger a new deployment)

### 2. Database Tables Don't Exist (Migrations Not Run)

**Symptoms:**
- Database connection works but queries fail
- Error mentions "table does not exist" or "relation does not exist"

**Solution:**
1. Set up your `DATABASE_URL` locally in `.env.local`
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Or if you need to create a new migration:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Push changes and redeploy

### 3. Prisma Client Not Generated During Build

**Symptoms:**
- Build succeeds but runtime errors about Prisma client

**Solution:**
- The `package.json` has been updated to automatically run `prisma generate` during build
- This should be handled automatically now

## Diagnostic Steps

### Step 1: Check Health Endpoint

After deploying, visit:
```
https://your-app.vercel.app/api/health
```

This will tell you:
- ✅ If `DATABASE_URL` is set
- ✅ If database connection works
- ✅ If Prisma client is available

### Step 2: Check Vercel Logs

1. Go to your Vercel project dashboard
2. Click on **Deployments**
3. Click on the latest deployment
4. Click on **Functions** tab
5. Look for error logs from `/api/leads`

Common errors you might see:
- `Environment variable not found: DATABASE_URL`
- `Can't reach database server`
- `P1001: Can't reach database server`
- `relation "Lead" does not exist`

### Step 3: Verify Environment Variables

1. In Vercel dashboard → Settings → Environment Variables
2. Verify `DATABASE_URL` exists
3. Check that it's added for the correct environments
4. Make sure there are no extra spaces or quotes in the value

### Step 4: Test Database Connection

If you have the connection string, test it locally:
```bash
# Set DATABASE_URL in your terminal
export DATABASE_URL="your-connection-string"

# Test connection
npx prisma db pull
```

## Quick Fix Checklist

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `DATABASE_URL` is added for Production, Preview, and Development
- [ ] Database migrations have been run
- [ ] Prisma client is generated (handled automatically in build)
- [ ] Database is not paused (for free tiers like Neon/Supabase)
- [ ] Connection string includes `?sslmode=require` if needed
- [ ] Redeployed after adding environment variables

## After Fixing

1. **Redeploy** your application
2. **Test the health endpoint**: `https://your-app.vercel.app/api/health`
3. **Test the API**: Submit a lead through the form
4. **Check Vercel logs** if issues persist

## Still Not Working?

If you've checked everything above and it's still not working:

1. **Check Vercel Function Logs** for the exact error
2. **Verify your PostgreSQL database is accessible** (not paused, not blocked by firewall)
3. **Test the connection string locally** to make sure it works
4. **Check if your database provider allows connections from Vercel's IPs** (most cloud providers do)

## Common Error Messages and Solutions

| Error | Solution |
|------|----------|
| `Environment variable not found: DATABASE_URL` | Add `DATABASE_URL` in Vercel environment variables |
| `P1001: Can't reach database server` | Check connection string, verify database is running |
| `relation "Lead" does not exist` | Run migrations: `npx prisma migrate deploy` |
| `SSL connection required` | Add `?sslmode=require` to connection string |
| `405 Method Not Allowed` | Usually means 500 error - check logs for actual error |
