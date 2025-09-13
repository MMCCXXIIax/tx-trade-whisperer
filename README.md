<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/23172b0b-3460-43d6-96ee-0ae883210c36

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/23172b0b-3460-43d6-96ee-0ae883210c36) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/23172b0b-3460-43d6-96ee-0ae883210c36) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---
# TX – Trading Intelligence Platform (Beta Frontend Spec)

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

**Frontend:** React + TypeScript (Vite) on port `5000`  
**Backend:** Python Flask + Socket.IO on port `8080`  
**Connection:**  
- Vite proxy routes `/api/*` → Flask backend  
- WebSocket for instant alerts: `ws://localhost:5000/socket.io/`

---

## 📡 Key API Endpoints

### Alerts
- `GET /api/get_active_alerts` → Active alerts list  
- WebSocket `/ws` → Real‑time alert stream

**Example Response:**
```json
{
  "alerts": [
    {
      "symbol": "ethereum",
      "pattern": "Doji",
      "confidence": "75%",
      "price": "4344.38",
      "explanation": "Doji detected — small body with equal shadows. Indicates market indecision.",
      "action": "Validate before trading."
    }
  ]
}


Market Scan

• `GET /api/scan` → Latest scan results


Example Response:

{
  "last_scan": {
    "id": 184,
    "time": "23:51:08",
    "results": [
      {"symbol": "bitcoin", "price": 113816.0, "status": "no_pattern"},
      {"symbol": "ethereum", "price": 4344.38, "status": "pattern"},
      {"symbol": "solana", "price": 223.97, "status": "no_pattern"}
    ]
  }
}


Entry/Exit Signals

• `GET /api/signals/entry-exit`


Example Response:

{
  "entry_price": 95432,
  "stop_loss": 90432,
  "take_profit_1": 105000,
  "take_profit_2": 115000,
  "risk_reward_ratio": "1:3.9"
}


---

🎯 Frontend MVP Requirements

Must‑Have (Beta)

• Customizable Dashboard — Users can rearrange, resize, and toggle widgets (alerts, scans, sentiment, portfolio, etc.).
• Interactive Onboarding Tutorial — A guided, clickable walkthrough for new users explaining each major feature.
• Tooltips Everywhere — Every section, tab, and feature should have a hover/click tooltip explaining its purpose.
• Theme Customization — Light, dark, and high‑contrast modes with persistent user preference.
• Alert Explanation Modal (core differentiator)
• Pattern Detection Dashboard
• Real‑Time Alert System (WebSocket + sound)
• Entry/Exit Signal Display


Should‑Have (v1.1)

• Backtesting Interface
• Paper Trading Dashboard
• Sentiment Analysis Display
• Strategy Builder


---

🎨 UI/UX Guidelines

Design Philosophy: Professional Intelligence Made Simple

• Clean, modern (Stripe/Linear‑style)
• Information‑dense but not overwhelming
• Action‑oriented with clear CTAs
• Mobile‑first responsive design


Color Palette:

• Primary: Deep Blue `#0B1426`
• Success: Bright Green `#00D8B0`
• Danger: Bright Red `#FF5B5B`
• Warning: Orange `#FF8800`
• Background: Light Gray `#F8FAFC`
• Text: Dark Gray `#1A202C`


Typography:

• Headers: Inter or Poppins
• Body: System fonts
• Code/Data: JetBrains Mono


Sound Design:

• Alert: Subtle but attention‑grabbing chime
• Success: Positive confirmation tone
• Error: Gentle warning tone
• Volume: User‑adjustable, persistent


---

🧩 Component‑by‑Component Build Checklist

1. Layout & Navigation• Global header with logo, nav links, theme toggle
• Sidebar with collapsible sections
• Responsive grid system

2. Customizable Dashboard• Widget container with drag‑and‑drop
• Widget resize & hide/show controls
• Save layout to local storage / user profile

3. Real‑Time Alerts Panel• WebSocket connection to `/ws`
• Alert list with pattern, confidence, price
• Sound + visual notification

4. Market Scan Table• Poll `/api/scan` every 60s
• Status badges (pattern/no pattern)
• Click row → open explanation modal

5. Pattern Explanation Modal• Pattern name, confidence, chart snippet
• Market context & psychology
• Entry/Stop/TP levels
• Risk/reward ratio

6. Entry/Exit Signal Card• Fetch `/api/signals/entry-exit`
• Display prices, risk %, R:R ratio
• Visual indicator for targets

7. Interactive Onboarding Tutorial• Step‑by‑step overlay highlighting features
• Skippable & replayable
• Progress indicator

8. Tooltips• Hover/click tooltips for all major UI elements
• Short, clear explanations
• Link to docs/help

9. Theme Customization• Light/Dark/High‑Contrast modes
• Persistent preference storage
• Smooth transitions

10. Settings Panel• User preferences (theme, sounds, dashboard layout)
• API key / backend URL config (if needed)
• Reset to defaults



---

🛡 Compliance Boundaries

• No financial advice — educational & analytical only
• No custody of funds
• User‑controlled execution
• Flat‑rate SaaS pricing


---

📈 Competitive Edge

• AI pattern detection + sentiment + actionable signals in one platform
• Educational explanations for every alert
• Integrated workflow from detection → analysis → simulation



## 🧩 Component‑by‑Component Build Checklist

### 1. Layout & Navigation
- [ ] Global header with logo, nav links, theme toggle
- [ ] Sidebar with collapsible sections
- [ ] Responsive grid system
- [ ] Smooth page transitions with subtle animations

### 2. **Customizable Dashboard**
- [ ] Widget container with drag‑and‑drop positioning
- [ ] Widget resize & hide/show controls
- [ ] Save layout to local storage / user profile
- [ ] Pre‑built widget types: Alerts, Market Scan, Sentiment, Portfolio, News
- [ ] Animated rearranging for a “live” feel

### 3. Real‑Time Alerts Panel
- [ ] WebSocket connection to `/ws`
- [ ] Alert list with pattern, confidence, price
- [ ] Sound + visual notification
- [ ] Animated alert entry/exit (fade/slide)

### 4. Market Scan Table
- [ ] Poll `/api/scan` every 60s
- [ ] Status badges (pattern/no pattern)
- [ ] Click row → open explanation modal
- [ ] Row highlight animation on update

### 5. Pattern Explanation Modal
- [ ] Pattern name, confidence, chart snippet
- [ ] Market context & psychology
- [ ] Entry/Stop/TP levels
- [ ] Risk/reward ratio
- [ ] Animated modal open/close

### 6. Entry/Exit Signal Card
- [ ] Fetch `/api/signals/entry-exit`
- [ ] Display prices, risk %, R:R ratio
- [ ] Visual indicator for targets
- [ ] Animated progress toward targets

### 7. **Interactive Onboarding Tutorial/Tour**
- [ ] Step‑by‑step overlay highlighting features
- [ ] Skippable & replayable
- [ ] Progress indicator
- [ ] Animated focus on highlighted elements

### 8. **Tooltips**
- [ ] Hover/click tooltips for all major UI elements
- [ ] Short, clear explanations
- [ ] Link to docs/help
- [ ] Smooth fade‑in/out animations

### 9. **Theme Customization**
- [ ] Light/Dark/System modes
- [ ] Persistent preference storage
- [ ] Smooth theme transition animations

### 10. Settings Panel
- [ ] User preferences (theme, sounds, dashboard layout)
- [ ] API key / backend URL config (if needed)
- [ ] Reset to defaults

---

## 📐 Dashboard Wireframe Map

**Top Row (full width)**  
- [ ] **Alerts Widget** — real‑time alerts stream  
- [ ] **Market Overview Widget** — key prices, sentiment snapshot

**Middle Row (split)**  
- Left: **Market Scan Table**  
- Right: **Pattern Explanation / Entry‑Exit Signals**

**Bottom Row (split)**  
- Left: **Portfolio/Paper Trading Widget**  
- Right: **News/Sentiment Widget**

> All widgets must be **draggable, resizable, and hideable**.  
> Layout changes should animate smoothly to give the dashboard a “living” feel.

---

## 🎨 Animation Guidelines
- Use **micro‑interactions** (hover effects, button presses) to make the UI feel responsive.
- Animate **data changes** (e.g., price updates fade/slide in).
- Keep animations **fast and purposeful** — avoid slowing down workflows.
- Use easing curves for natural motion.

---

## 🛡 Compliance Boundaries
- No financial advice — educational & analytical only
- No custody of funds
- User‑controlled execution
- Flat‑rate SaaS pricing


This now gives You AgentLabs both the functional spec and the visual/interaction blueprint for TX Beta’s frontend.
>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
