# Sticky Rice FC - New Features Summary

## 🎯 Features Added

### 1. ✅ Waitlist System (26 Player Cap)
**What it does:**
- Limits each game to 26 players max
- Players 27+ automatically join waitlist
- Shows "X / 26 spots available" counter
- Waitlist displayed in orange section below main squad

**User experience:**
- **No change!** Users still just enter their name and click "Sign Up"
- If full, they get message: "All spots are full. You've been added to the waitlist."
- Waitlist players can still cancel their signup

**Visual:**
- Main squad: Purple numbered badges (1, 2, 3...)
- Waitlist: Orange badges (W1, W2, W3...)
- Spot counter shows in green when available, orange when full

---

### 2. 💳 Payment QR Code
**What it does:**
- Shows PromptPay/banking QR code at top of Payments tab
- Players scan → pay → upload proof

**How to use (Admin):**
1. Generate your PromptPay QR code
2. Upload image to Supabase Storage (bucket: `payment-proofs` or create new bucket)
3. Copy the public URL
4. In Admin Panel → Create Game → paste URL in "Payment QR Code URL" field

**User experience:**
- QR code shows as large image with purple border
- Text: "Scan with your banking app to pay"
- Instructions updated to mention QR code

---

### 3. 💬 Comments Section
**What it does:**
- Simple message board at bottom of EVERY tab
- Players can post questions, coordinate rides, chat

**Features:**
- Only people who signed up can comment (uses localStorage name)
- Shows timestamp for each comment
- Users can delete their own comments
- Real-time updates when switching tabs

**Use cases:**
- "Need a ride from Nimman?"
- "Bringing extra balls"
- "Running 10 mins late"

---

## 📋 What You Need to Do

### Step 1: Run the SQL
Go to Supabase SQL Editor and run [add-new-features.sql](add-new-features.sql)

This will:
- Add `max_players` column (default 26)
- Add `payment_qr_code_url` column
- Add `is_waitlist` column to signups
- Create `comments` table with RLS policies

### Step 2: (Optional) Upload Payment QR Code
1. Generate your PromptPay QR code
2. Go to Supabase Storage
3. Upload to any bucket
4. Copy public URL
5. In Admin Panel → Edit game or create new game → paste URL

### Step 3: Done!
The features are live immediately after running the SQL.

---

## 🎨 What Changed in the UI

### Players Tab
- Shows "X / 26 spots available" under title
- Squad List shows "16 / 26" badge
- New orange "Waitlist" section if spots are full
- Comments section at bottom

### Payments Tab
- QR code image at top (if URL is set)
- Comments section at bottom

### Album Tab
- Comments section at bottom

### Location Tab
- Comments section at bottom

### Admin Panel
- New fields when creating games:
  - "Max Players" (number input, default 26)
  - "Payment QR Code URL" (text input, optional)

---

## 🚀 How the Waitlist Works

**Example scenario:**

1. Game created with max 26 players
2. Players 1-26 sign up → show in main "Squad List"
3. Player 27 signs up → automatically goes to "Waitlist" section
4. If Player 3 cancels → Player 27 is still on waitlist
5. Admin can manually promote from waitlist if needed

**Note:** Waitlist promotion is NOT automatic. If someone cancels, you'll need to tell waitlist players they can sign up again (or manually move them in the database).

---

## 💡 Tips

### For Payment QR Code
- Use a permanent PromptPay QR code (not amount-specific)
- Store QR image in Supabase Storage for reliability
- You can use different QR codes for different games

### For Comments
- Players must sign up first before commenting
- Comments are per-week (different weeks have different comment threads)
- Useful for coordinating beyond just sign-ups

### For Waitlist
- 26 is the default but you can change it per-game in Admin Panel
- Some pitches might be smaller → use 20 players
- Bigger events → use 30+ players

---

## 🐛 Troubleshooting

**"Full - Joining waitlist" shows even with 0 players**
→ You didn't run the SQL yet. The database doesn't have `max_players` column.
→ Code defaults to 26, so 0/26 = full.
→ **Fix:** Run [add-new-features.sql](add-new-features.sql)

**QR code doesn't show**
→ The `payment_qr_code_url` field is empty in database
→ **Fix:** Add URL via Admin Panel when creating/editing game

**Can't post comments**
→ You need to sign up first
→ Comments use your localStorage name
→ **Fix:** Go to Players tab → Sign up first

**Comments not loading**
→ SQL not run yet (comments table doesn't exist)
→ **Fix:** Run [add-new-features.sql](add-new-features.sql)

---

## 📝 Files Changed

**New files:**
- `src/components/CommentsSection.tsx` - Comments component

**Modified files:**
- `src/types/index.ts` - Added Week.max_players, Week.payment_qr_code_url, Signup.is_waitlist, Comment type
- `src/components/PlayersTab.tsx` - Waitlist logic, spot counter, comments
- `src/components/PaymentsTab.tsx` - QR code display, comments
- `src/components/AlbumTab.tsx` - Comments
- `src/components/LocationTab.tsx` - Comments
- `src/components/AdminPanel.tsx` - New form fields for max_players and payment_qr_code_url

**SQL files:**
- `add-new-features.sql` - Database migration (MUST RUN THIS!)

---

## ✨ What's Next?

Currently implemented:
✅ Waitlist with 26 player cap
✅ Payment QR code
✅ Comments section
✅ Spot counter

**Possible future enhancements** (not implemented):
- Auto-promote from waitlist when someone cancels
- Email/SMS notifications
- Polls for venue changes
- Player statistics (games played)
- RSVP status (Yes/Maybe/No)

Let me know if you want any of these!
