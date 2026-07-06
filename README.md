<div align="center">

# 🌱 FeedForward
### *AI-Powered Food Redistribution Platform*

**Turning surplus into sustenance — one donation at a time.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![OpenStreetMap](https://img.shields.io/badge/Maps-OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://openstreetmap.org)

<br/>

> 🍛 **284 Active NGOs** · 🧑‍🤝‍🧑 **3,421 Donors Today** · 🍽️ **892K Meals Served**

</div>

---

## 🧠 What is FeedForward?

Every day, **40% of food produced globally is wasted** while 828 million people go hungry. FeedForward bridges this gap using AI to intelligently match food donors with nearby NGOs — in real time, with live GPS tracking and zero bureaucracy.

Built as an **academic engineering prototype**, FeedForward demonstrates how mobile technology, AI analysis, and real-time logistics can solve one of humanity's most preventable problems.

---

## ✨ Key Features

### 🤖 AI Food Intelligence
- **Freshness Scoring** — AI analyzes your food's remaining shelf life using multi-factor scoring (preparation time, storage conditions, food category)
- **Smart NGO Matching** — Algorithm scores 10+ nearby NGOs by distance, capacity, food type compatibility, and past acceptance rate
- **Impact Projection** — Real-time calculation of meals served, CO₂ saved, and carbon offset per donation

### 🗺️ Live GPS Tracking
- **Real Map** — OpenStreetMap tiles (no Google API key required — fully free & open source)
- **Animated Rider** — 🏍️ Live animation: rider spawns near donor → travels to pickup → delivers to NGO
- **Traveled Path** — Green line grows in real-time as the rider moves
- **LIVE Badge** — Pulsing indicator confirms the map is active

### 🤝 Smart NGO Matching
- 10 NGOs notified simultaneously with a 15-second response window
- Each NGO independently decides (45% acceptance probability, 3–13s random response delay)
- First to accept gets the donation — feels like a real platform dispatch system
- NGO locations are real GPS coordinates near the donor

### 💰 CSR Sponsor Integration
- Sponsors (e.g. TechCorp) fund delivery costs via their CSR dashboard
- Donors see "₹0 delivery cost — sponsored by TechCorp" in checkout
- Sponsors track real-time impact: meals funded, CO₂ offset, NGOs supported

### 📊 Analytics Dashboard
- Donor impact metrics: meals donated, CO₂ saved, streak days
- Platform-wide live stats updated in real time
- Donation history with full status timeline (Matched → In Transit → Delivered)

---

## 👥 User Roles

| Role | What They Do |
|------|-------------|
| 🏠 **Donor** | Donates surplus food, tracks rider live, views impact |
| ❤️ **NGO** | Receives food requests, manages pickups, views analytics |
| 🏢 **Sponsor** | Funds deliveries via CSR budget, tracks sponsored impact |
| 🛡️ **Admin** | Platform-wide management dashboard |

---

## 📱 Donor Flow
Register → Donate Food → AI Freshness Analysis
→ Smart NGO Matching (live 15s window)
→ Choose Delivery (NGO Volunteer or Booked Ride)
→ Live GPS Tracking (real map, animated rider 🏍️)
→ Delivery Confirmed ✅

---

## 🛠️ Tech Stack
📱 Mobile App Expo SDK 54 + React Native 0.81
🧭 Navigation Expo Router (file-based, tab + stack)
🗺️ Maps react-native-webview + Leaflet + OpenStreetMap
📍 GPS expo-location (real device GPS)
💾 Storage AsyncStorage (local persistence)
🎨 UI Custom design system, expo-linear-gradient, expo-blur
🔤 Fonts Inter (400/500/600/700) via expo-google-fonts
✏️ Language TypeScript 5.9
📦 Package Manager pnpm workspaces
🏗️ API Server Express 5 + Drizzle ORM + PostgreSQL

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Expo Go app (iOS/Android) **or** EAS account for builds

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/feedforward.git
cd feedforward

# Install dependencies
pnpm install

# Install WebView for real map support
npx expo install react-native-webview
# Start Expo development server
pnpm --filter @workspace/food-redistribution run dev

# Scan the QR code with Expo Go on your phone
# One-time EAS setup
eas login
eas build:configure

# Build APK
eas build --platform android
feedforward/
├── artifacts/
│   ├── food-redistribution/        # 📱 Expo mobile app
│   │   ├── app/
│   │   │   ├── (donor)/            # Donor screens & flow
│   │   │   ├── (ngo)/              # NGO dashboard
│   │   │   ├── (sponsor)/          # Sponsor dashboard
│   │   │   ├── (admin)/            # Admin panel
│   │   │   └── _layout.tsx         # Root navigator
│   │   ├── components/
│   │   │   ├── LiveMap.tsx         # 🗺️ Real map (WebView + Leaflet)
│   │   │   └── LiveMap.web.tsx     # Web variant
│   │   ├── context/AppContext.tsx  # Global state
│   │   ├── data/mockData.ts        # Mock NGOs, donations, analytics
│   │   ├── hooks/useColors.ts      # Theme-aware color tokens
│   │   └── constants/colors.ts    # Design tokens
│   └── api-server/                 # Express API backend
├── lib/
│   ├── api-spec/openapi.yaml       # API contract
│   └── db/src/schema/              # Drizzle DB schema
└── pnpm-workspace.yaml
🗺️ Map Architecture
FeedForward uses Leaflet + OpenStreetMap instead of Google Maps — completely free, no API key, works everywhere.

react-native-webview
    └── Leaflet.js (JavaScript map library)
            └── OpenStreetMap tiles (free, real street data)
                    └── Custom markers: 🏠 Donor · 🏍️ Rider · ❤️ NGO

Rider Animation Logic:

Rider spawns 0.6km northeast of donor's real GPS location
Smoothly animates to donor's location (pickup)