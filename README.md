# Sticky Rice FC - Football Organizer Web App

A professional web application for managing weekly football games, built with Astro, React, TypeScript, and Supabase.

## 🎯 Features

### Player Management
- **Weekly Game Sign-ups** - Players can sign up for upcoming games
- **Automatic Waitlist System** - When games are full, players are added to waitlist
- **Auto-Promotion** - When someone cancels, first waitlist player is automatically promoted
- **Smart Notifications** - Professional toast and modal notifications for all actions

### Payment Tracking
- **QR Code Payments** - Admin can upload payment QR codes directly from admin panel
- **Payment Proof Upload** - Players upload payment screenshots
- **Admin Verification** - Admins can mark payments as verified
- **Post-Game Reminders** - Automatic payment reminders after games end

### Admin Panel
- **Auto-Create Games** - Automatically create games every Monday at 6 PM
- **Game Management** - Create, edit, and delete games
- **Announcements** - Create rotating announcements shown to all players
- **Settings Configuration** - Set default pitch, max players, payment amounts
- **Password Protected** - Secure admin access

### Social Features
- **Photo Gallery** - Upload and share game photos
- **Comments & Replies** - Threaded discussions for each game
- **Real-time Updates** - Supabase real-time subscriptions

### Professional UI/UX
- **Toast Notifications** - Non-blocking, color-coded feedback
- **Modal Dialogs** - Professional confirmation and information modals
- **Responsive Design** - Mobile-first, works perfectly on all devices
- **SVG Icons** - Professional icons throughout (no emojis)
- **Smooth Animations** - Slide-in, fade-in, scale-in effects

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jingyuan-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**

   Go to your Supabase SQL Editor and run:
   ```
   database/complete-migration.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:4321
   ```

## 📁 Project Structure

```
/
├── database/           # SQL migration scripts
│   └── complete-migration.sql  # Main setup script
├── docs/              # User guides and documentation
│   ├── QR-CODE-UPLOAD-GUIDE.md
│   ├── WAITLIST-AUTO-PROMOTION.md
│   └── PROFESSIONAL-UI-UPDATES.md
├── public/            # Static assets
├── src/
│   ├── components/    # React components
│   │   ├── AdminPanel.tsx
│   │   ├── PlayersTab.tsx
│   │   ├── PaymentsTab.tsx
│   │   ├── AlbumTab.tsx
│   │   ├── CommentsSection.tsx
│   │   ├── Toast.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── ...
│   ├── lib/           # Utilities and hooks
│   │   ├── supabase.ts
│   │   ├── useToast.ts
│   │   └── ...
│   ├── types/         # TypeScript type definitions
│   └── pages/         # Astro pages
│       ├── index.astro
│       ├── admin.astro
│       └── game/[id].astro
└── tailwind.config.mjs
```

## 🧞 Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally before deploying |

## 🔧 Admin Access

**URL:** `/admin`

**Password:** `StickyRice!Mon2026`

### Admin Features:
- Create and manage weekly games
- Upload payment QR codes
- Create announcements
- Configure auto-create settings
- Set payment amounts
- View all signups and payments

## 📚 Documentation

See the [docs](./docs) folder for detailed guides:
- **QR Code Upload Guide** - How to manage payment QR codes
- **Waitlist Auto-Promotion** - How the waitlist system works
- **Professional UI Updates** - Overview of UI/UX improvements

## 🗄️ Database Setup

The `database/complete-migration.sql` file sets up:
- All required tables (weeks, signups, payments, comments, announcements, etc.)
- Row Level Security (RLS) policies
- Storage buckets for photos and QR codes
- Indexes for performance

## 🎨 Tech Stack

- **Frontend Framework:** Astro 5
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Real-time:** Supabase Realtime

## 🚢 Deployment

### Deploy to Netlify (Recommended)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Go to Netlify and connect your repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   Add your Supabase credentials:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Netlify will automatically build and deploy
   - Updates deploy automatically on push to main

### Deploy to Vercel

Similar process - connect GitHub repo, set build command and environment variables.

## 📝 License

MIT

## 🤝 Contributing

This is a private project for Sticky Rice FC, but suggestions and improvements are welcome!

## 📧 Contact

For questions about the app, contact the admin.

---

**Built with ❤️ for Sticky Rice FC**
