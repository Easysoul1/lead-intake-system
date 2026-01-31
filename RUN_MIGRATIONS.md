# How to Run Database Migrations

## The Problem

Your database tables don't exist yet. The migration needs to be run against your production PostgreSQL database.

## Quick Fix

You need to run the migrations with your production `DATABASE_URL`. Here's how:

### Option 1: Run Locally with Production Database (Recommended)

1. **Get your DATABASE_URL from Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy the value of `DATABASE_URL`

2. **Run migrations locally**:
   ```bash
   # Set the DATABASE_URL temporarily (Windows PowerShell)
   $env:DATABASE_URL="your-vercel-database-url-here"
   
   # Or create/update .env.local with the production URL temporarily
   # DATABASE_URL="your-vercel-database-url-here"
   
   # Run migrations
   npx prisma migrate deploy
   ```

3. **Test that it worked**:
   - Try submitting a lead on your Vercel site
   - It should work now!

### Option 2: Use Prisma Studio (Visual)

1. **Set DATABASE_URL** (same as above)
2. **Open Prisma Studio**:
   ```bash
   npx prisma studio
   ```
3. This will open a browser where you can see your database tables
4. If you see the `Lead` table, migrations worked!

### Option 3: Direct SQL (Advanced)

If you have direct database access, you can run the SQL directly. The migration file is at:
`prisma/migrations/20260131000939_init/migration.sql`

## After Running Migrations

Once migrations are complete:
- ✅ Your database will have the `Lead` table
- ✅ All indexes will be created
- ✅ Your API should work on Vercel

## Verify It Worked

1. Go to your Vercel site
2. Try submitting a lead
3. Check the dashboard - you should see the lead appear

## Important Notes

- **Don't run `prisma migrate dev`** - that's for development only
- **Use `prisma migrate deploy`** - this is for production
- The migration will only run if it hasn't been applied before (Prisma tracks this)

## Troubleshooting

**Error: "Migration already applied"**
- This means the migration already ran - you're good to go!

**Error: "Can't reach database server"**
- Check your DATABASE_URL is correct
- Make sure your database is not paused (for free tiers)
- Verify SSL is enabled if required

**Error: "relation already exists"**
- Tables already exist - migrations might have run automatically
- Try submitting a lead to test
