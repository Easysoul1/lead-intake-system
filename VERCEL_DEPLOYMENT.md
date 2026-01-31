# Vercel Deployment Guide

## The Problem

SQLite doesn't work on Vercel because:
- Vercel uses serverless functions that are stateless
- SQLite requires a persistent file system
- The database file can't be deployed or accessed in Vercel's serverless environment

**Solution**: Use PostgreSQL instead, which works perfectly with Vercel's serverless architecture.

## Quick Setup Options

### Option 1: Vercel Postgres (Recommended - Easiest)

1. **Create a Vercel Postgres Database**:
   - Go to your Vercel project dashboard
   - Navigate to the "Storage" tab
   - Click "Create Database" → Select "Postgres"
   - Choose a name and region
   - Click "Create"

2. **Add Environment Variable**:
   - Vercel will automatically add the `POSTGRES_URL` environment variable
   - However, Prisma expects `DATABASE_URL`, so you need to:
     - Go to Project Settings → Environment Variables
     - Add a new variable:
       - Name: `DATABASE_URL`
       - Value: Copy the value from `POSTGRES_URL` (or use `POSTGRES_URL` directly)
     - Make sure to add it for **Production**, **Preview**, and **Development** environments

3. **Run Migrations**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations (you'll need to do this locally first, then push)
   npx prisma migrate deploy
   ```

4. **Deploy**:
   - Push your changes to GitHub
   - Vercel will automatically redeploy

### Option 2: Neon (Free Serverless PostgreSQL)

1. **Sign up at [neon.tech](https://neon.tech)** (free tier available)

2. **Create a new project**:
   - Create a new database
   - Copy the connection string (it will look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

3. **Add to Vercel**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `DATABASE_URL` with the Neon connection string
   - Make sure to add it for all environments

4. **Run Migrations**:
   ```bash
   # Set DATABASE_URL locally (or use .env.local)
   export DATABASE_URL="your-neon-connection-string"
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   ```

5. **Deploy**:
   - Push your changes to GitHub
   - Vercel will automatically redeploy

### Option 3: Supabase (Free PostgreSQL)

1. **Sign up at [supabase.com](https://supabase.com)** (free tier available)

2. **Create a new project**:
   - Create a new project
   - Go to Settings → Database
   - Copy the connection string (under "Connection string" → "URI")

3. **Add to Vercel**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `DATABASE_URL` with the Supabase connection string
   - Make sure to add it for all environments

4. **Run Migrations**:
   ```bash
   # Set DATABASE_URL locally
   export DATABASE_URL="your-supabase-connection-string"
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   ```

5. **Deploy**:
   - Push your changes to GitHub
   - Vercel will automatically redeploy

## Migration Steps

After setting up PostgreSQL, you need to:

1. **Update your local environment** (for development):
   ```bash
   # Create .env.local with your PostgreSQL connection string
   DATABASE_URL="postgresql://user:password@localhost:5432/lead_intake?schema=public"
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Create and run migrations**:
   ```bash
   # Create a new migration
   npx prisma migrate dev --name migrate_to_postgresql
   
   # For production (on Vercel), migrations should run automatically
   # Or you can run manually:
   npx prisma migrate deploy
   ```

4. **Verify locally**:
   ```bash
   npm run dev
   # Test that the app works with PostgreSQL
   ```

5. **Deploy to Vercel**:
   - Make sure `DATABASE_URL` is set in Vercel environment variables
   - Push your code to trigger a new deployment
   - Vercel will automatically run `prisma generate` during build

## Important Notes

- **Connection String Format**: PostgreSQL connection strings look like:
  ```
  postgresql://user:password@host:port/database?sslmode=require
  ```

- **SSL Mode**: Most cloud PostgreSQL providers require SSL. Make sure your connection string includes `?sslmode=require` or `?sslmode=prefer`

- **Environment Variables**: Make sure to add `DATABASE_URL` in Vercel for:
  - Production
  - Preview
  - Development (if you want to test locally with the same DB)

- **Prisma Migrations**: 
  - For local development: Use `npx prisma migrate dev`
  - For production: Use `npx prisma migrate deploy` (or let Vercel handle it)

## Troubleshooting

### Error: "Can't reach database server"
- Check that `DATABASE_URL` is correctly set in Vercel
- Verify the connection string format
- Make sure SSL is enabled if required

### Error: "405 Method Not Allowed"
- This was likely caused by the SQLite database connection failing
- After switching to PostgreSQL, this should be resolved
- Make sure migrations have run successfully

### Error: "P1001: Can't reach database server"
- Database connection issue
- Verify your `DATABASE_URL` environment variable
- Check that your database provider allows connections from Vercel's IPs
- For Neon/Supabase, make sure the database is not paused (free tiers may pause inactive databases)

## Testing After Deployment

1. **Check API endpoint**:
   - Visit: `https://your-app.vercel.app/api/leads`
   - Should return proper error (method not allowed for GET) or handle POST requests

2. **Submit a test lead**:
   - Go to your deployed app
   - Fill out the lead form
   - Submit and verify it works

3. **Check dashboard**:
   - Navigate to `/dashboard`
   - Verify leads are displayed correctly

## Next Steps

After successful deployment:
- Monitor your database usage
- Set up database backups (most providers offer this)
- Consider connection pooling for better performance (Prisma handles this automatically)
