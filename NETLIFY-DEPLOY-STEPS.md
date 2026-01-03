# 🚀 Netlify Deployment - Step by Step

Follow these exact steps to deploy your Sticky Rice FC app to Netlify.

## Step 1: Go to Netlify

Open this URL in your browser:
```
https://app.netlify.com/
```

- Log in with GitHub (if you haven't already)

## Step 2: Import Your Project

1. Click the big **"Add new site"** button (or "Import an existing project")
2. Choose **"Deploy with GitHub"**
3. You'll see a list of your repositories
4. Find and click **"stickyrice-fc"**
5. Click **"Deploy stickyrice-fc"**

## Step 3: Configure Build Settings

Netlify should auto-detect these settings. Verify they match:

```
Build command: npm run build
Publish directory: dist
```

**Important:** Scroll down to **"Environment variables"** section BEFORE clicking deploy!

## Step 4: Add Environment Variables

Click **"Add environment variables"** and add these TWO variables:

### Variable 1:
```
Key: PUBLIC_SUPABASE_URL
Value: https://gllvzrjyuplairmubzbu.supabase.co
```

### Variable 2:
```
Key: PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbHZ6cmp5dXBsYWlybXViemJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzMxMDgsImV4cCI6MjA4MjkwOTEwOH0.52AP-nP0klgrOb1sEaTxIqnJmgTmMI32qZWV9Jf7FOs
```

**How to add:**
1. Click "New variable"
2. Paste the Key name
3. Paste the Value
4. Click "Add"
5. Repeat for the second variable

## Step 5: Deploy!

1. After adding BOTH environment variables, click **"Deploy stickyrice-fc"** button
2. Wait 2-3 minutes for the build to complete
3. You'll see the build logs - watch for success!

## Step 6: View Your Live Site

Once the build completes:
1. Netlify will show you the URL (something like `https://sparkly-unicorn-123abc.netlify.app`)
2. Click the URL to open your live site!
3. Copy the URL and test all features

## Step 7: Test Your Live Site

Visit these pages and test:
- [ ] Homepage loads correctly
- [ ] Can view the current week's game
- [ ] Can sign up for a game
- [ ] Admin panel works at `/admin`
- [ ] Can log in to admin: `StickyRice!Mon2026`
- [ ] Photos load correctly
- [ ] Comments work
- [ ] Announcements show

## Step 8: Admin Setup

1. Go to `https://YOUR-SITE.netlify.app/admin`
2. Log in with: `StickyRice!Mon2026`
3. Click **"⚙️ Auto-Create Settings"**
4. Upload your payment QR code
5. Set payment amount: `100`
6. Create a welcome announcement
7. Click **"Save Settings"**

## 🎉 You're Live!

Your app is now deployed and accessible to anyone with the URL!

**Next Steps:**
- Share the URL with your team
- Test all features on mobile
- Consider setting up a custom domain (optional)

## 🔧 Future Updates

Whenever you make changes:
1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
2. Netlify will automatically rebuild and deploy!
3. Live in ~2-3 minutes

## 📝 Your Environment Variables (Save This!)

```
PUBLIC_SUPABASE_URL=https://gllvzrjyuplairmubzbu.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbHZ6cmp5dXBsYWlybXViemJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzMxMDgsImV4cCI6MjA4MjkwOTEwOH0.52AP-nP0klgrOb1sEaTxIqnJmgTmMI32qZWV9Jf7FOs
```

Keep these safe - you'll need them if you redeploy or deploy elsewhere!

---

**Need help?** Check the build logs in Netlify if deployment fails.
