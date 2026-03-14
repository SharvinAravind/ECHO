# EchoWrite - AI Writing Assistant

## Project Structure

```
/
├── web/                    # Frontend (React + Vite)
│   ├── src/              # React source code
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks (useAuth, useDictation)
│   │   ├── lib/         # Libraries (Firebase config)
│   │   ├── pages/       # Page components
│   │   ├── services/   # AI services (OpenAI)
│   │   └── assets/     # Images, logos
│   ├── public/          # Static assets
│   └── dist/           # Built files
│
├── mobile/               # Android App (Capacitor)
│   └── app/src/main/
│       └── res/         # Resources (icons, splash)
│
├── functions/           # Firebase Cloud Functions (Backend)
│
├── docs/                # Documentation
│
├── archive/             # Archived old files
│
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev          # Runs on http://localhost:8080

# Build web app
npm run build

# Build Android APK
npm run android:build
```

## Environment Variables (.env)

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI (via OpenRouter)
VITE_OPENROUTER_API_KEY=your_key

# App Check (production)
VITE_FIREBASE_APP_CHECK_SITE_KEY=your_key
```

## Features

- ✅ Voice-to-Text (25+ languages)
- ✅ AI Content Generation (OpenAI GPT-4)
- ✅ 26 Writing Styles
- ✅ Firebase Authentication (Email + Google)
- ✅ Mobile App (Android)
- ✅ App Check enabled

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Firebase (Auth, Functions, App Check)
- OpenAI (via OpenRouter)
- Capacitor (Mobile)
