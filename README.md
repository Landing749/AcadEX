# 📚 Acadex — Academic Productivity Tracker

A full-featured Progressive Web App (PWA) for students to manage subjects, assignments, grades, and academic performance.

## ✨ Features

- 📋 **Assignment Management** — Track with due dates, types, status, and priority
- 📚 **Subject Management** — Organize classes by color, icon, semester
- 🏆 **Grade Tracking** — GPA, averages, letter grades, progress toward targets
- 📅 **Calendar View** — Monthly calendar with color-coded assignments
- 📊 **Analytics** — Charts for grade trends, completion rates, subject performance
- 📸 **File Uploads** — Photos, PDFs, DOCX, PPT via Cloudinary (camera supported)
- 🌙 **Dark/Light Mode** — System-aware and manually togglable
- 📱 **PWA / Installable** — Works on iOS, Android, and desktop
- ✈️ **Offline First** — Full offline support with background sync
- 🔒 **Firebase Auth** — Email/password with persistent sessions

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📦 Build & Deploy

```bash
npm run build
```

### GitHub Pages
Push to `main` branch — GitHub Actions auto-deploys via `.github/workflows/deploy.yml`.

**Setup:**
1. Go to **Settings → Pages**
2. Set **Source** to `GitHub Actions`
3. Push to `main`

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Firebase Realtime Database |
| Storage | Cloudinary |
| Offline DB | IndexedDB (idb) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | CSS + Tailwind |
| PWA | Service Worker + Web App Manifest |

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Login, Register, Forgot Password
│   ├── dashboard/     # Main dashboard
│   ├── subjects/      # Subject management
│   ├── assignments/   # Assignment tracking
│   ├── grades/        # Grade analytics
│   ├── calendar/      # Monthly calendar
│   ├── analytics/     # Charts & insights
│   ├── uploads/       # File upload with camera
│   ├── layout/        # Sidebar + mobile nav
│   └── ui/            # Reusable components
├── contexts/          # Auth, Theme, Sync contexts
├── hooks/             # Firebase data hooks
├── lib/               # Firebase, Cloudinary, IndexedDB
├── types/             # TypeScript types
└── utils/             # Helper functions
public/
├── sw.js              # Service Worker
├── manifest.json      # PWA Manifest
└── icons/             # App icons (all sizes)
```

## 📸 Camera Support

Students can take photos directly in the app for:
- Uploading handwritten notes
- Capturing assignment sheets
- Documenting lab work

Uses `capture="environment"` for rear camera on mobile.

## 🔄 Offline Support

- All data is cached in IndexedDB
- Assignments and subjects work fully offline
- File uploads queue when offline and sync on reconnect
- Sync status shown in real-time (synced / syncing / offline / pending / failed)

## 🔥 Firebase Setup

The app uses these Firebase services:
- **Authentication** — Email/password
- **Realtime Database** — All user data

Database rules (set in Firebase Console):
```json
{
  "rules": {
    "subjects": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "assignments": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```
