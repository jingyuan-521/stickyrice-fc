# Deployment Guide - Sticky Rice FC

This guide will help you deploy the Sticky Rice FC app to GitHub and Netlify.

## 📋 Pre-Deployment Checklist

- [x] All SQL files organized in `database/` folder
- [x] All documentation in `docs/` folder
- [x] `.env` file is in `.gitignore` (never commit secrets!)
- [x] `.env.example` file exists for reference
- [x] README.md is complete and professional
- [ ] Database migrations run in Supabase
- [ ] Environment variables ready for Netlify

## 🗄️ Step 1: Set Up Database

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gllvzrjyuplairmubzbu/sql/new
   ```

2. **Run the complete migration:**
   - Open `database/complete-migration.sql`
   - Copy all contents
   - Paste in SQL Editor
   - Click "Run"

3. **Verify tables were created:**
   - Check the Tables section in Supabase
   - You should see: weeks, signups, payments, comments, announcements, game_settings, etc.

## 📝 Step 2: Push to GitHub

1. **Initialize Git (if not already done):**
   ```bash
   cd /Users/jingyuan/jingyuan-website
   git init
   ```

2. **Check what will be committed:**
   ```bash
   git status
   ```

   Make sure `.env` is NOT listed (should be ignored by `.gitignore`)

3. **Add all files:**
   ```bash
   git add .
   ```

4. **Commit:**
   ```bash
   git commit -m "Initial commit: Sticky Rice FC web app"
   ```

5. **Create GitHub repository:**
   - Go to https://github.com/new
   - Name: `sticky-rice-fc` (or your preferred name)
   - Keep it **Private** (recommended)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

6. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sticky-rice-fc.git
   git branch -M main
   git push -u origin main
   ```

## 🚀 Step 3: Deploy to Netlify

1. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Log in with GitHub

2. **Import Project:**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Find your `sticky-rice-fc` repository
   - Click "Deploy"

3. **Configure Build Settings:**

   Netlify should auto-detect Astro, but verify:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Add Environment Variables:**

   Go to Site Settings → Environment Variables → Add variables:

   ```
   PUBLIC_SUPABASE_URL = https://gllvzrjyuplairmubzbu.supabase.co
   PUBLIC_SUPABASE_ANON_KEY = [your anon key from Supabase]
   ```

   To find your Supabase keys:
   - Go to https://supabase.com/dashboard/project/gllvzrjyuplairmubzbu/settings/api
   - Copy the "Project URL" and "anon public" key

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://[random-name].netlify.app`

6. **Set Custom Domain (Optional):**
   - Go to Site Settings → Domain Management
   - Add your custom domain if you have one

## ✅ Step 4: Test Deployed App

1. **Visit your Netlify URL**

2. **Test these features:**
   - [ ] Homepage loads correctly
   - [ ] Can view current week's game
   - [ ] Can sign up for a game
   - [ ] Admin panel accessible at `/admin`
   - [ ] Admin can log in with password
   - [ ] Can upload photos
   - [ ] Can add comments
   - [ ] Announcements display correctly

3. **Admin Setup:**
   - Go to `/admin`
   - Log in with: `StickyRice!Mon2026`
   - Click "Auto-Create Settings"
   - Upload payment QR code
   - Set payment amount (e.g., 100 THB)
   - Enable auto-create if desired
   - Click "Save Settings"

## 🔄 Future Updates

After initial deployment, to update the live site:

1. **Make changes locally**

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. **Netlify auto-deploys:**
   - Netlify detects the push
   - Automatically rebuilds and deploys
   - Live in ~2-3 minutes

## 🐛 Troubleshooting

### Build fails on Netlify

**Check:**
- Environment variables are set correctly
- No TypeScript errors (run `npm run build` locally first)
- All dependencies in package.json

### Database connection fails

**Check:**
- `PUBLIC_SUPABASE_URL` is correct
- `PUBLIC_SUPABASE_ANON_KEY` is correct
- Supabase project is active (not paused)
- RLS policies are set up (run `complete-migration.sql`)

### Images/Photos not loading

**Check:**
- Supabase storage buckets exist
- RLS policies allow public read access
- Storage policies were created in migration

### Admin panel password doesn't work

**Check:**
- Using exact password: `StickyRice!Mon2026`
- No extra spaces before/after
- Caps lock is off

## 📊 Monitoring

After deployment, monitor:

1. **Netlify Dashboard:**
   - Build status
   - Deploy logs
   - Bandwidth usage

2. **Supabase Dashboard:**
   - Database usage
   - Storage usage
   - API requests

## 🔒 Security Notes

**Never commit to GitHub:**
- `.env` file (contains secrets)
- Any files with passwords or API keys
- Database backups with real data

**Already protected by .gitignore:**
- `.env`
- `.env.production`
- `node_modules/`
- `dist/` (build output)

## 📈 Next Steps

After successful deployment:

1. **Share URL** with players
2. **Create first game** via admin panel
3. **Upload payment QR code**
4. **Create welcome announcement**
5. **Test payment flow** end-to-end
6. **Backup database** regularly via Supabase

## 🎉 Success!

Your Sticky Rice FC app is now live! Players can:
- Sign up for games
- Upload payment proofs
- Share photos
- Comment and discuss

Admins can:
- Manage games
- Track payments
- Create announcements
- Configure settings

---

**Need help?** Check the documentation in the `docs/` folder.
