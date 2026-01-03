# QR Code Upload Feature - Admin Guide

## Overview

Admins can now **upload and update the payment QR code** directly from the admin panel - no need to use Supabase!

---

## Setup Required (One-Time Only)

### Run the SQL Script

Go to: https://supabase.com/dashboard/project/gllvzrjyuplairmubzbu/sql/new

Copy and paste the contents of **`create-qr-storage.sql`** from your Desktop, then click **"Run"**

This will:
- Create a `qr-codes` storage bucket
- Set up RLS policies to allow uploads
- Enable public access to view QR codes

---

## How to Upload/Update QR Code

### Step 1: Access Admin Panel

1. Go to: http://localhost:4321/admin (or your deployed URL)
2. Enter admin password: `StickyRice!Mon2026`
3. Click the blue **⚙️ Auto-Create Settings** button

### Step 2: Upload QR Code

In the **Auto-Create Settings** panel:

1. Scroll down to **"Default Payment QR Code"** section
2. You'll see:
   - **Current QR Code preview** (if one exists) - 192x192px display
   - **File upload button** - Blue styled button
   - **Helper text** explaining what it's for

3. Click **"Choose File"** and select your QR code image (PNG, JPG, etc.)
4. Upload automatically starts
5. You'll see:
   - Loading spinner: "Uploading QR code..."
   - Success toast: "QR code uploaded successfully!"

### Step 3: Save Settings

1. The new QR code URL is automatically updated in the form
2. Click **"Save Settings"** to persist the change
3. Success toast: "Settings updated successfully!"

---

## Features

### QR Code Preview
- **Visual confirmation** - See exactly what players will see
- **192x192 pixels** - Clear, readable size
- **White background** - Clean presentation
- **Gray border** - Professional look

### Smart Upload
- **Automatic URL generation** - File uploaded to Supabase Storage
- **Unique filenames** - `payment-qr-{timestamp}.{extension}`
- **Instant preview update** - See new QR code immediately
- **Loading indicator** - Clear feedback during upload

### Professional UI
- **Blue styled file button** - Matches admin theme
- **Hover effects** - Interactive and polished
- **Loading spinner** - Animated SVG during upload
- **Toast notifications** - Success/error feedback
- **Help text** - Clear instructions

---

## What Happens Behind the Scenes

1. **File Upload:**
   ```
   Admin selects image → Uploaded to Supabase Storage (qr-codes bucket)
   → Public URL generated → URL saved to gameSettings
   ```

2. **Database Update:**
   ```
   Settings form → default_payment_qr_code_url updated
   → Click "Save Settings" → game_settings table updated
   → Future auto-created games use new QR code
   ```

3. **Player View:**
   ```
   Player opens Payments tab → QR code displayed from URL
   → Player scans to pay → Admin marks as paid
   ```

---

## File Format Support

**Accepted formats:**
- PNG (recommended)
- JPG/JPEG
- GIF
- WebP
- Any image format

**Best practices:**
- **Square image** - QR codes are naturally square
- **High resolution** - At least 512x512px
- **Clear background** - White or transparent works best
- **Test scan** - Make sure QR code scans properly before uploading

---

## Storage Location

**Supabase Storage:**
- Bucket: `qr-codes`
- Public access: Yes
- Files: `payment-qr-{timestamp}.{ext}`

**Example URL:**
```
https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/qr-codes/payment-qr-1735905234567.png
```

---

## Visual Walkthrough

### Before Upload:
```
┌─────────────────────────────────────────┐
│ Default Payment QR Code                 │
├─────────────────────────────────────────┤
│                                         │
│  [No QR code preview shown]            │
│                                         │
│  [Choose File] No file chosen          │
│                                         │
│  ℹ️ Upload your payment QR code image.  │
│     This will be shown to all players.  │
└─────────────────────────────────────────┘
```

### During Upload:
```
┌─────────────────────────────────────────┐
│ Default Payment QR Code                 │
├─────────────────────────────────────────┤
│  Current QR Code:                       │
│  ┌─────────────────┐                   │
│  │                 │                   │
│  │   [QR CODE]     │                   │
│  │                 │                   │
│  └─────────────────┘                   │
│                                         │
│  [Choose File] qr-code.png             │
│                                         │
│  🔄 Uploading QR code...               │
└─────────────────────────────────────────┘
```

### After Upload:
```
┌─────────────────────────────────────────┐
│ Default Payment QR Code                 │
├─────────────────────────────────────────┤
│  Current QR Code:                       │
│  ┌─────────────────┐                   │
│  │                 │                   │
│  │   [NEW QR]      │                   │
│  │                 │                   │
│  └─────────────────┘                   │
│                                         │
│  [Choose File] No file chosen          │
│                                         │
│  ✓ QR code uploaded successfully!      │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### "Upload failed: The resource already exists"
**Solution:** The qr-codes bucket might already exist. This is fine - just try uploading again.

### "Upload failed: new row violates row-level security policy"
**Solution:** Run the `create-qr-storage.sql` script to set up RLS policies.

### QR code doesn't appear for players
**Solution:** Make sure you clicked **"Save Settings"** after uploading.

### Preview shows old QR code
**Solution:** Refresh the page after clicking "Save Settings".

---

## Benefits

### For Admins:
✅ **No Supabase access needed** - Upload directly from admin panel
✅ **Visual confirmation** - See exactly what was uploaded
✅ **Quick updates** - Change QR code anytime in seconds
✅ **Professional UI** - Beautiful, intuitive interface

### For Players:
✅ **Always current** - See the latest QR code
✅ **High quality** - Clear, scannable codes
✅ **Fast loading** - Served from Supabase CDN

---

## Security Notes

- **Public bucket** - QR codes are viewable by anyone (this is intentional)
- **No sensitive data** - QR codes only contain payment info
- **Admin only** - Only admins can upload/change QR codes
- **RLS enabled** - Supabase Row Level Security protects the data

---

## Files Created

1. **`create-qr-storage.sql`** - SQL to create storage bucket
2. **`QR-CODE-UPLOAD-GUIDE.md`** - This documentation

## Files Modified

1. **`AdminPanel.tsx`** - Added QR upload feature and preview

---

## Summary

You can now upload and update your payment QR code **directly from the admin panel**!

**Steps:**
1. ✅ Run `create-qr-storage.sql` (one-time setup)
2. ✅ Go to Admin → Auto-Create Settings
3. ✅ Upload new QR code image
4. ✅ Click "Save Settings"
5. ✅ Done! Players see the new QR code

No more logging into Supabase to update payment details! 🎉
