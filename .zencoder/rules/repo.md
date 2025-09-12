---
description: Repository Information Overview
alwaysApply: true
---

# TX Trade Whisperer Information

## Summary
TX Trade Whisperer is an AI-powered trading intelligence platform that provides real-time pattern detection, educational explanations, and actionable entry/exit signals across crypto, stocks, and forex markets. It features a React frontend with TypeScript and a Node.js Express backend with WebSocket support for real-time alerts.

## Structure
- **src/**: Frontend React application with TypeScript
- **server/**: Backend Express server with API endpoints
- **shared/**: Shared schema definitions for database
- **public/**: Static assets for the frontend
- **supabase/**: Supabase database migrations

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: ES2020+ (Frontend), ESNext (Backend)
**Build System**: Vite
**Package Manager**: npm/yarn
**Node Version**: >=20 <25 (as specified in package.json)

## Dependencies
**Main Dependencies**:
- **Frontend**: React 18, React Router, Radix UI components, TailwindCSS
- **Data Visualization**: Recharts, Lightweight Charts
- **State Management**: React Query
- **Form Handling**: React Hook Form, Zod
- **Backend**: Express, Socket.io, WebSockets
- **Database**: Drizzle ORM, Neon Serverless Postgres
- **Authentication**: Supabase Auth

**Development Dependencies**:
- TypeScript 5.8
- ESLint 9
- SWC (via Vite plugin)
- Tailwind plugins

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Database schema push
npm run db:push
```

## Database
**Type**: PostgreSQL (via Neon Serverless)
**ORM**: Drizzle ORM
**Schema**: Defined in shared/schema.ts
**Tables**: Users, Profiles, Detections, Portfolio, AppState, ErrorLogs, Visitors, SecurityAuditLog

## Architecture
**Frontend**: React + TypeScript (Vite) on port 8080
**Backend**: Express + Socket.IO on port 3000
**Connection**:
- Vite proxy routes `/api/*` → Express backend
- WebSocket for real-time alerts via Socket.io

## Main Features
- Real-time pattern detection with WebSocket alerts
- Interactive dashboard with customizable widgets
- Market scanning and analysis
- Entry/exit signal generation
- Backtesting capabilities
- Paper trading simulation
- Sentiment analysis

## API Endpoints
- `/api/alerts/recent`: Get recent alerts
- `/api/backtest/pattern`: Run pattern backtests
- `/api/detect/:symbol`: Get pattern detections for a symbol
- `/api/signals/entry-exit`: Get entry/exit signals
- `/api/patterns/list`: Get available patterns
- `/api/assets/list`: Get available assets
- `/api/features`: Get feature status
- `/api/status`: Get system status
- `/api/explain/pattern/:pattern`: Get pattern explanations