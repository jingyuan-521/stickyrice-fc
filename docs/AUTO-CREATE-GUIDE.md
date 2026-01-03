# Auto-Create Games Feature Guide

## Overview

The auto-create feature automatically generates a new game for next Monday whenever the admin panel loads. This saves you time by using default settings for recurring weekly games.

## How It Works

1. **When you open the admin panel**, the system:
   - Checks if auto-create is enabled in settings
   - Calculates the next Monday's date
   - Checks if a game already exists for that Monday
   - If no game exists, creates one automatically using your default settings

2. **Default settings include**:
   - Pitch name and address
   - Max players (default: 26)
   - Payment QR code URL
   - Lock time (hours before game)
   - Game time is always 6:00 PM on Monday

## Admin Controls

### Configure Auto-Create Settings

1. Log in to admin panel: [http://localhost:4321/admin](http://localhost:4321/admin)
2. Click the **⚙️ Auto-Create Settings** button
3. Toggle **Enable auto-create for Monday games** on/off
4. Edit default settings:
   - **Default Pitch Name**: Where you play (e.g., "NL Arena")
   - **Default Pitch Address**: Full address
   - **Default Max Players**: Usually 26
   - **Default Payment QR Code URL**: Your payment QR code URL
   - **Lock Time**: Hours before game (default: 2 hours, so locks at 4 PM)
5. Click **Save Settings**

### Edit an Auto-Created Game

If there's a last-minute change (venue, time, etc.):

1. Go to **All Games** section in admin panel
2. Find the game you want to edit
3. Click the purple **Edit** button
4. Update any fields:
   - Game date
   - Pitch name/address
   - Lock time
   - Max players
   - Payment QR code URL
5. Click **Update Game** (or **Create Game** if creating new)

### Delete an Auto-Created Game

If you need to cancel a Monday game:

1. Go to **All Games** section
2. Find the game
3. Click the red **Delete** button
4. Confirm deletion

The system will create a new game for the next Monday when you open the admin panel again (if auto-create is still enabled).

### Disable Auto-Create Temporarily

If you don't want auto-creation for a while:

1. Click **⚙️ Auto-Create Settings**
2. Uncheck **Enable auto-create for Monday games**
3. Click **Save Settings**

You can always re-enable it later.

## Examples

### Example 1: Change venue for one week

Your usual venue is "NL Arena" but this week you're playing at "Central Stadium":

1. Auto-create already created the game with "NL Arena"
2. Click **Edit** on that game
3. Change **Pitch Name** to "Central Stadium"
4. Update **Pitch Address** and **Pitch Maps URL**
5. Click **Update Game**

Next week, auto-create will use your default "NL Arena" again.

### Example 2: Game starts earlier this week

Usually 6:00 PM, but this week it's 5:00 PM:

1. Click **Edit** on the game
2. Update **Lock Time** to close earlier (e.g., 3 PM instead of 4 PM)
3. Click **Update Game**

Note: The game time is shown on the main page as "6:00 – 8:00 PM" (hardcoded in MobileHeader). To change this, you'd need to edit the code.

### Example 3: No game this Monday

Holiday or everyone's busy:

1. Click **Delete** on the Monday game
2. Confirm deletion
3. Done! No one can sign up

Auto-create will create next Monday's game when you check the admin panel again.

## Technical Details

- **Auto-create triggers**: When admin panel loads and you're authenticated
- **Next Monday calculation**: Finds the next occurrence of Monday from today
- **Lock time calculation**: Game time (6 PM) minus hours before (default 2) = 4 PM lock time
- **Database table**: `game_settings` stores your defaults
- **Game time**: Fixed at 6:00 PM Monday (edit code to change)

## Troubleshooting

**Q: Auto-create isn't working**
- Check if auto-create is enabled in settings
- Make sure you've run `complete-setup.sql` (includes game_settings table)
- Check browser console for errors

**Q: Games keep getting created for dates I don't want**
- Disable auto-create in settings
- Delete unwanted games manually

**Q: Want to change default QR code**
- Click ⚙️ Auto-Create Settings
- Update **Default Payment QR Code URL**
- Save settings
- All future auto-created games will use the new QR code

**Q: Can I change the game time from 6 PM?**
- This requires code changes in `AdminPanel.tsx` (line ~102)
- Change `lockTime.setHours(18 - settings.default_lock_time_hours_before, 0, 0, 0)`
- 18 = 6 PM in 24-hour format

## Files Modified

- [`AdminPanel.tsx`](/Users/jingyuan/jingyuan-website/src/components/AdminPanel.tsx) - Auto-create logic
- [`types/index.ts`](/Users/jingyuan/jingyuan-website/src/types/index.ts) - GameSettings type
- [`complete-setup.sql`](/Users/jingyuan/Desktop/complete-setup.sql) - Database schema

---

**You're all set!** Auto-create will handle your weekly Monday games automatically. Just edit when needed and enjoy the time saved! ⚽️
