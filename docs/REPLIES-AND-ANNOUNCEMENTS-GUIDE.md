# Comment Replies & Announcements Feature Guide

## Overview

Two new major features have been added:

1. **Threaded Comment Replies** - Users can reply to comments and see conversation threads
2. **Announcement Banner** - Admin can post announcements that appear at the top of all pages

## Setup Required

### Step 1: Run the SQL

Go to: https://supabase.com/dashboard/project/gllvzrjyuplairmubzbu/sql/new

Copy and paste **add-replies-and-announcements.sql** from your Desktop, then click "Run"

This will:
- Add `parent_id` column to comments table for threading
- Create `announcements` table with RLS policies
- Set up proper indexes

---

## Comment Replies Feature

### How It Works

**For Players:**
- Click the "Reply" button under any comment
- Type your reply - it will be nested under the original comment
- Replies are visually indented and have a purple background
- You can reply up to 3 levels deep
- Deleting a parent comment also deletes all its replies

**Visual Design:**
- Parent comments: Gray background with thick border
- Replies: Purple/lavender background, indented with "↳ Reply" badge
- Each reply level is further indented (max 3 levels)

### Features

- Thread conversations naturally
- See who replied to whom
- Delete your own comments and replies
- Automatically scroll to top when clicking Reply
- Cancel reply mode anytime

---

## Announcements Feature

### How It Works

**For Admin:**

1. Log in to admin panel: http://localhost:4321/admin
2. Click the orange **📢 Announcements** button
3. Type your announcement and click "Post Announcement"
4. Manage announcements:
   - **Hide**: Temporarily hide without deleting
   - **Show**: Make visible again
   - **Delete**: Remove permanently

**For Players:**

- Announcements appear in a purple banner at the very top of all pages
- Shows up to 3 most recent active announcements
- Displays who posted it and when
- Stays visible across all tabs (Players, Payments, Album, Location)

### Admin Controls

**Create Announcement:**
```
1. Click 📢 Announcements button
2. Type your message
3. Click "Post Announcement"
```

**Hide/Show:**
- Click "Hide" button to make announcement invisible (but keep it)
- Click "Show" to make it visible again
- Hidden announcements show "• Inactive" label

**Delete:**
- Click "Delete" button
- Confirm deletion
- Announcement is permanently removed

### Use Cases

**Good announcements:**
- "Game canceled this Monday due to rain"
- "New venue! We're playing at Central Stadium this week"
- "Payment deadline: Please pay by Saturday 6 PM"
- "Special event: Bring friends! No player limit this week"

---

## Technical Details

### Database Changes

**Comments Table:**
- Added `parent_id UUID` - links to parent comment
- Added index on `parent_id` for performance
- CASCADE delete: deleting parent deletes all replies

**Announcements Table:**
```sql
- id: UUID primary key
- message: TEXT (the announcement content)
- created_by: TEXT (who created it, usually "Admin")
- created_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ (optional expiry date)
- is_active: BOOLEAN (show/hide toggle)
```

### Component Changes

**CommentsSection.tsx:**
- Now builds a tree structure from flat comment list
- Renders nested `CommentItem` components recursively
- Max depth of 3 levels to prevent excessive nesting
- Shows "Replying to..." indicator when reply mode active

**AnnouncementBanner.tsx:**
- New component that queries active announcements
- Filters by `is_active = true` and not expired
- Displays in purple gradient banner
- Automatically hides if no active announcements

**AdminPanel.tsx:**
- Added orange "📢 Announcements" button
- New section for creating and managing announcements
- Shows all announcements with Hide/Show/Delete controls
- Color-coded: active (orange), inactive (gray)

**GamePage.tsx:**
- AnnouncementBanner added at the very top
- Wraps entire page layout
- Visible across all tabs

---

## Files Created/Modified

### New Files:
1. `add-replies-and-announcements.sql` - Database migration
2. `AnnouncementBanner.tsx` - Banner component
3. `REPLIES-AND-ANNOUNCEMENTS-GUIDE.md` - This file

### Modified Files:
1. `types/index.ts` - Added `parent_id` and `replies` to Comment type, added Announcement type
2. `CommentsSection.tsx` - Complete rewrite with threading logic
3. `AdminPanel.tsx` - Added announcement management UI and functions
4. `GamePage.tsx` - Integrated AnnouncementBanner
5. `AlbumTab.tsx` - Added photo delete button (bonus feature!)

---

## Testing Checklist

### Comment Replies:
- [ ] Post a regular comment
- [ ] Click "Reply" on that comment
- [ ] Post a reply - should appear nested below
- [ ] Reply to the reply (2nd level)
- [ ] Reply to 2nd level (3rd level - should work)
- [ ] Try replying to 3rd level (should not show Reply button - max depth)
- [ ] Delete a parent comment - all replies should be deleted
- [ ] Cancel reply mode - should clear the "Replying to..." box

### Announcements:
- [ ] Admin: Click 📢 Announcements button
- [ ] Create an announcement
- [ ] Check that it appears at the top of the main page
- [ ] Switch between tabs - announcement should stay visible
- [ ] Admin: Click "Hide" - announcement should disappear from main page
- [ ] Admin: Click "Show" - announcement should reappear
- [ ] Admin: Delete announcement - should be gone permanently
- [ ] Create multiple announcements - max 3 should show

---

## SQL to Run

**File:** `/Users/jingyuan/Desktop/add-replies-and-announcements.sql`

**What it does:**
1. Adds `parent_id` column to comments (NULL for root comments)
2. Creates announcements table with all needed columns
3. Sets up RLS policies so anyone can view/create/update/delete
4. Creates indexes for better performance

**Run in:** Supabase SQL Editor

---

## Summary

✅ **Comment Replies** - Threaded conversations with 3-level nesting
✅ **Announcements** - Admin-only announcements at top of all pages
✅ **Photo Delete** - Bonus: delete photos from album

All features are ready to use after running the SQL migration!
