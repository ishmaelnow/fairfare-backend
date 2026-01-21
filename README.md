# PWA Apps - Progressive Web Applications

Separate Progressive Web Apps built for web browsers, connecting to the shared backend API.

## 🎯 Structure

```
pwa-apps/
├── rider-pwa/          ← Rider PWA (booking rides)
├── driver-pwa/         ← Driver PWA (driver dashboard)
├── admin-pwa/          ← Admin PWA (manage drivers)
└── README.md           ← This file
```

## 🔗 Backend Connection

All PWAs connect to: `http://localhost:8001/api`

**Backend Location:** `../react-frontend-backend/`

## ✨ PWA Features

Each PWA includes:
- ✅ Service Worker (offline support)
- ✅ Web App Manifest (installable)
- ✅ Responsive design
- ✅ Offline caching
- ✅ App-like experience
- ✅ Fast loading

## 🚀 Quick Start

### Rider PWA
```bash
cd rider-pwa
npm install
npm run dev
```
Runs on: `http://localhost:3001`

### Driver PWA
```bash
cd driver-pwa
npm install
npm run dev
```
Runs on: `http://localhost:3002`

### Admin PWA
```bash
cd admin-pwa
npm install
npm run dev
```
Runs on: `http://localhost:3003`

## 📱 Installation

Each PWA can be installed on:
- Desktop (Chrome, Edge, Safari)
- Mobile browsers (iOS Safari, Chrome Android)
- As standalone apps

## 🔒 Authentication

All PWAs use the same authentication:
- JWT tokens stored in localStorage
- Shared backend API
- Same user accounts

## 📦 Build for Production

```bash
cd rider-pwa
npm run build
# Output: dist/ folder (ready to deploy)
```

## 🌐 Deployment

Each PWA can be deployed separately:
- Netlify
- Vercel
- GitHub Pages
- Your own server

All connect to the same backend API!

