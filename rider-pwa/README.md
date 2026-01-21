# Rider PWA

Progressive Web App for riders to book rides with FairFare Transportation.

## 🚀 Features

- ✅ Installable (Add to Home Screen)
- ✅ Offline support
- ✅ Fast loading
- ✅ Responsive design
- ✅ Book rides
- ✅ View ride history
- ✅ Real-time updates

## 📦 Installation

```bash
npm install
```

## 🏃 Run Development Server

```bash
npm run dev
```

Runs on: `http://localhost:3001`

## 🔨 Build for Production

```bash
npm run build
```

Output: `dist/` folder (ready to deploy)

## 🔗 Backend API

Connects to: `http://localhost:8001/api`

Make sure the backend is running before using this PWA.

## 📱 Install as App

1. Open in browser
2. Look for "Install" button in address bar
3. Or: Menu → "Install Rider App"
4. App will appear on home screen

## 🌐 Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8001
```

## 📋 Pages

- `/login` - User login
- `/register` - User registration
- `/book-ride` - Book a new ride
- `/dashboard` - View ride history

## 🔒 Authentication

Uses JWT tokens stored in localStorage.
Same authentication as web app.
