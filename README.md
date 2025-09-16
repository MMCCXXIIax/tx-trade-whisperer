# TX – Trading Intelligence Platform

## 📌 Overview
**TX** is an AI‑powered trading intelligence assistant — not a financial advisor, broker, or fund manager.  
It delivers **real‑time pattern detection**, **educational explanations**, and **actionable entry/exit signals** across crypto, stocks, and forex — while keeping the user in full control of execution and funds.

**Tagline:** *"Your Intelligent Trading Co‑Pilot — Always in Your Hands."*

---

## 🚀 Core Mission
Equip traders with world‑class tools for:
- AI‑driven candlestick pattern recognition
- Real‑time market scanning
- Educational breakdowns of patterns and strategies
- Risk‑managed entry/exit signals
- Backtesting and paper trading
- Sentiment analysis from multiple sources

---

## 🏗 Architecture

**Frontend:** React + TypeScript (Vite)  
**Backend:** Express + Socket.IO  
**Connection:**  
- Express server serves the React frontend
- WebSocket for instant alerts

---

## Getting Started

To run this project locally:

```sh
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm start
```

---

## 🎯 Frontend Features

### Must‑Have (Beta)

- Customizable Dashboard — Users can rearrange, resize, and toggle widgets (alerts, scans, sentiment, portfolio, etc.).
- Interactive Onboarding Tutorial — A guided, clickable walkthrough for new users explaining each major feature.
- Tooltips Everywhere — Every section, tab, and feature should have a hover/click tooltip explaining its purpose.
- Theme Customization — Light, dark, and high‑contrast modes with persistent user preference.
- Alert Explanation Modal (core differentiator)
- Pattern Detection Dashboard
- Real‑Time Alert System (WebSocket + sound)
- Entry/Exit Signal Display

### Should‑Have (v1.1)

- Backtesting Interface
- Paper Trading Dashboard
- Sentiment Analysis Display
- Strategy Builder

---

## 🎨 UI/UX Guidelines

### Design Philosophy: Professional Intelligence Made Simple

- Clean, modern (Stripe/Linear‑style)
- Information‑dense but not overwhelming
- Action‑oriented with clear CTAs
- Mobile‑first responsive design

### Color Palette:

- Primary: Deep Blue `#0B1426`
- Success: Bright Green `#00D8B0`
- Danger: Bright Red `#FF5B5B`
- Warning: Orange `#FF8800`
- Background: Light Gray `#F8FAFC`
- Text: Dark Gray `#1A202C`

### Typography:

- Headers: Inter or Poppins
- Body: System fonts
- Code/Data: JetBrains Mono

---

## 🛡 Compliance Boundaries
- No financial advice — educational & analytical only
- No custody of funds
- User‑controlled execution
- Flat‑rate SaaS pricing

---

## 📈 Competitive Edge

- AI pattern detection + sentiment + actionable signals in one platform
- Educational explanations for every alert
- Integrated workflow from detection → analysis → simulation