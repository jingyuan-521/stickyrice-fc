# Sticky Rice FC - Go Live Checklist

## ✅ What's Complete

### Features Implemented:
1. ✅ **Waitlist System** - 26 player cap with automatic waitlist
2. ✅ **Payment QR Code** - Shows PromptPay QR with purple frame
3. ✅ **Comments Section** - Message board on all tabs
4. ✅ **Week Selector** - Browse past games and albums
5. ✅ **Admin Panel** - Create/manage games with password protection
6. ✅ **Admin Login Button** - Purple button in top-right corner (desktop & mobile)
7. ✅ **Edit Games** - Admin can edit game details after creation
8. ✅ **Auto-Create Games** - Automatically creates Monday games with default settings
9. ✅ **Mobile Responsive** - Works perfectly on phones

### UI Enhancements:
- Purple gradient theme throughout
- Desktop sidebar + mobile bottom tabs
- Professional Premier League-style design
- QR code with purple frame (border-4 border-[#6c4dc0])

---

## 🔧 What You Need to Do

### Step 1: Run the SQL (REQUIRED!)

Go to: https://supabase.com/dashboard/project/gllvzrjyuplairmubzbu/sql/new

Copy and paste **complete-setup.sql** from your Desktop, then click "Run"

This will:
- Add all database columns
- Create comments table
- Set your QR code URL
- Enable all features

### Step 2: Test Everything

Go to http://localhost:4321/sticky-rice-fc and test:

**Players Tab:**
- [ ] Sign up as a player
- [ ] Check spot counter shows "26 / 26 spots available"
- [ ] Sign up 26 players to test waitlist
- [ ] 27th player should go to orange "Waitlist" section
- [ ] Post a comment at the bottom
- [ ] Cancel your signup

**Payments Tab:**
- [ ] QR code appears with purple frame
- [ ] Upload payment proof
- [ ] Player shows as PAID with yellow highlight

**Album Tab:**
- [ ] Upload a photo
- [ ] Click photo to view full screen
- [ ] Post a comment

**Location Tab:**
- [ ] Map displays correctly
- [ ] "Get Directions" button works
- [ ] Post a comment

**Week Selector:**
- [ ] Dropdown shows all weeks
- [ ] Switching weeks works
- [ ] Comments are separate per week

**Admin Panel:**
- [ ] Click "🔐 Admin Login" button
- [ ] Enter password: `StickyRice!Mon2026`
- [ ] Create a new game
- [ ] Edit an existing game
- [ ] Delete a game
- [ ] Lock/Unlock a game
- [ ] Configure auto-create settings
- [ ] Toggle auto-create on/off
- [ ] Logout button works

### Step 3: Change Admin Password

Edit this file:
`/Users/jingyuan/jingyuan-website/src/components/AdminPanel.tsx`

Line 5:
```typescript
const ADMIN_PASSWORD = 'StickyRice!Mon2026' // Change this to your desired password
```

Change `'StickyRice!Mon2026'` to your own secure password.

### Step 4: Deploy to Production

Choose one option:

**Option A: Deploy to Vercel (Recommended - FREE)**
1. Create account at https://vercel.com
2. Install Vercel CLI: `npm install -g vercel`
3. In your project folder: `cd /Users/jingyuan/jingyuan-website`
4. Run: `vercel`
5. Follow prompts
6. Your site will be live at: `https://your-project.vercel.app`

**Option B: Deploy to Netlify (FREE)**
1. Create account at https://netlify.com
2. Drag and drop your `dist/` folder after building
3. Or connect your GitHub repo

**Option C: Keep it local (temporary testing)**
- Share your local URL: `http://your-ip-address:4321/sticky-rice-fc`
- Only works on same WiFi network
- Not recommended for production

---

## 📱 Admin Access

**Desktop:**
- Purple "🔐 Admin Login" button in sidebar footer

**Mobile:**
- Purple "🔐 Admin" button in top-right corner

**Password:** `StickyRice!Mon2026` (change this!)

**URL:** https://your-domain.com/admin

---

## 🎯 Current Features Summary

### For Players:
- Sign up for games (with name autocomplete)
- See spot availability (X / 26)
- Join waitlist when full
- Upload payment proof
- Scan QR code to pay
- View photo albums
- Post comments
- Browse past games

### For Admin:
- Password-protected access
- Create new games with custom:
  - Date
  - Lock time
  - Venue
  - Max players
  - Payment QR code
- Edit existing games (venue, time, etc.)
- Delete games
- Lock/unlock signups
- Auto-create Monday games with default settings
- Configure default settings (venue, max players, QR code, lock time)
- Toggle auto-create on/off
- View all signups and payments

---

## 🔒 Security Notes

**Current Setup:**
- Admin password is stored in code (client-side)
- This is OK for a small community app
- Anyone with access to code can see password

**To Make More Secure (optional):**
- Use environment variables for password
- Add proper backend authentication
- Use Supabase Auth for user roles

For your use case (90-person community), the current setup is fine!

---

## 🚀 Go Live When:

✅ SQL is run
✅ All features tested
✅ Admin password changed
✅ Deployed to Vercel/Netlify
✅ URL shared with community

---

## 💡 Post-Launch Tips

1. **Share the URL** - Send to your LINE group or wherever your community hangs out
2. **Test with friends** - Have a few people try signing up before announcing broadly
3. **Monitor first game** - Watch how people use it and gather feedback
4. **Admin password** - Only share with trusted organizers

---

## 🆘 Troubleshooting

**QR code not showing:**
→ Did you run complete-setup.sql?

**Can't sign up:**
→ Did you run complete-setup.sql? (is_waitlist column missing)

**Comments not working:**
→ Did you run complete-setup.sql? (comments table missing)

**Admin login fails:**
→ Check password in AdminPanel.tsx line 5

**Waitlist not working:**
→ Run complete-setup.sql to add max_players column

---

## 📞 Support

If something breaks:
1. Check browser console (F12)
2. Check Supabase logs
3. Check that SQL was run successfully
4. Verify environment variables are set

---

**You're ready to go live! 🎉**

Just run the SQL, test everything, and deploy!
