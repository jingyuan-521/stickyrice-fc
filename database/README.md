# Database Migrations

This folder contains SQL migration scripts for the Sticky Rice FC database.

## Most Important Migration

**For fresh setup, run this file first:**
- `complete-migration.sql` - Complete database setup including:
  - Comment replies & announcements
  - QR code storage bucket
  - Payment amount field

## Running Migrations

1. Go to your Supabase SQL Editor:
   https://supabase.com/dashboard/project/gllvzrjyuplairmubzbu/sql/new

2. Copy the contents of `complete-migration.sql`

3. Paste and click "Run"

## Other Migration Files

The other SQL files in this folder are for reference or specific updates:
- `update-qr-code.sql` - Update payment QR code URL
- `add-*.sql` - Individual feature additions
- `fix-*.sql` - Bug fixes and corrections

## Notes

- Always run `complete-migration.sql` for new deployments
- Individual migration files may already be included in `complete-migration.sql`
- Back up your database before running migrations in production
