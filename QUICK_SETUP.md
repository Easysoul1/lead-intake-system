# Quick PostgreSQL Setup for Local Development

## Option 1: Neon (Recommended - 2 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click "Create a project"
3. Choose a name and region (closest to you)
4. Click "Create project"
5. You'll see a connection string like:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
6. Copy this connection string
7. Open `.env.local` in your project
8. Paste it as the value for `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```
9. Save the file
10. Run: `npx prisma generate`
11. Run: `npx prisma migrate dev --name migrate_to_postgresql`

Done! You can use this same connection string in Vercel for production.

## Option 2: Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for it to finish setting up (~2 minutes)
4. Go to Settings → Database
5. Find "Connection string" → "URI"
6. Copy the connection string
7. Paste it into `.env.local` as `DATABASE_URL`
8. Run: `npx prisma generate`
9. Run: `npx prisma migrate dev --name migrate_to_postgresql`

## Option 3: Local PostgreSQL (Advanced)

If you have PostgreSQL installed locally:

1. Create a database:
   ```bash
   createdb lead_intake
   ```
2. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/lead_intake?schema=public"
   ```
   (Replace `postgres` and `password` with your PostgreSQL username and password)
3. Run: `npx prisma generate`
4. Run: `npx prisma migrate dev --name migrate_to_postgresql`

## After Setup

Once you've set up the database and updated `.env.local`:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Run Migrations**:
   ```bash
   npx prisma migrate dev --name migrate_to_postgresql
   ```

3. **Test Locally**:
   ```bash
   npm run dev
   ```

4. **For Vercel Deployment**:
   - Use the same connection string (or create a Vercel Postgres database)
   - Add `DATABASE_URL` in Vercel → Settings → Environment Variables
   - Redeploy

## Troubleshooting

**Error: "Environment variable not found: DATABASE_URL"**
- Make sure `.env.local` exists in the project root
- Make sure the file contains `DATABASE_URL="your-connection-string"`
- Restart your terminal/IDE after creating the file

**Error: "Can't reach database server"**
- Check your connection string is correct
- For cloud databases, make sure the database is not paused
- Check your internet connection

**Error: "SSL connection required"**
- Make sure your connection string includes `?sslmode=require` at the end
