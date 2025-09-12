# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TX Trade Whisperer is an AI-powered trading intelligence application built as a React frontend that communicates with a backend API for market analysis and pattern detection. This is a Lovable-generated project with a focus on real-time trading alerts and paper trading simulation.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom TX brand colors
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Lightweight Charts, Recharts
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Package Manager**: npm (uses package-lock.json)

## Key Development Commands

### Development
```bash
# Install dependencies
npm i

# Start development server (runs on port 8080)
npm run dev

# Build for development mode
npm run build:dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

### Code Quality
```bash
# Run ESLint
npx eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0

# Type checking
npx tsc --noEmit

# Format check (no formatter configured, but TypeScript compilation serves as validation)
```

## Architecture Overview

### Application Structure
The app follows a standard React SPA pattern with the following key architectural decisions:

1. **Route-based Architecture**: Main routes are:
   - `/auth` - Authentication page (public)
   - `/auth-loading` - Post-OAuth session hydration (public)  
   - `/welcome` - Onboarding flow (protected)
   - `/tx-dashboard` - Main trading dashboard (protected)
   - `/` - Redirects to dashboard

2. **Component Hierarchy**:
   - `App.tsx` - Root component with routing
   - `TXDashboard` - Main dashboard orchestrating all trading features
   - Feature components: `TradingView`, `AlertCenter`, `DetectionLogs`, `PaperTrading`
   - UI components in `/src/components/ui` following shadcn/ui patterns

3. **Data Flow**:
   - API calls through `/src/lib/api.ts` using `safeFetch` wrapper
   - Supabase integration for auth and user profiles
   - Real-time data polling for market scans and alerts
   - Local state management with React hooks

### Core Features
- **Real-time Market Monitoring**: Polls backend API every 180 seconds for market scans
- **Alert System**: Active alert detection with sound notifications and user response handling
- **Paper Trading**: Simulation mode for testing strategies
- **Performance Tracking**: Win/loss outcome logging for detected patterns
- **Multi-asset Support**: Monitors various trading pairs and patterns

### Backend API Integration
The frontend expects these key API endpoints (served from `/api`):
- `GET /api/scan` - Gets latest market scan results
- `GET /api/get_active_alerts` - Checks for new trading alerts
- `POST /api/handle_alert_response` - Handles user response to alerts
- `POST /api/log_outcome` - Records trade outcomes
- `GET /api/get_latest_detection_id` - Gets most recent detection for outcome logging

## Styling System

### TX Brand Colors (defined in Tailwind config)
- `tx-green` - Primary brand color for success states and branding
- `tx-black` - Primary dark background
- `tx-gray` - Secondary text and borders
- `tx-red` - Error/destructive states
- `tx-blue` - Accent color for information
- `tx-orange` - Warning/snooze states

### Component Patterns
- Uses shadcn/ui component library with consistent theming
- Terminal-inspired design with `terminal-container` class
- Alert animations using `alert-glow` class
- Custom button variants: `tx-button`, `tx-button-primary`, etc.

## Development Workflow

### Pre-commit Hooks
- Husky configured with pre-push hook
- Runs type checking, linting, and build verification
- Script located in `scripts/prepush.sh`

### Environment Setup
- Node.js >=20 <25 (specified in package.json)
- Uses hardcoded Supabase credentials (not environment variables, per Lovable guidelines)
- Development server runs on `http://localhost:8080`
- Production server serves static files from `/dist`

## Testing Strategy

**Note**: No test framework is currently configured. When adding tests:
- Consider Vitest for unit testing (aligns with Vite)
- React Testing Library for component testing  
- Playwright or Cypress for E2E testing
- Focus on testing alert logic, API integrations, and critical user flows

## Key Files to Understand

### Core Application
- `src/App.tsx` - Application routing and structure
- `src/components/TXDashboard.tsx` - Main dashboard with real-time features
- `src/lib/api.ts` - API utility functions and base configuration
- `src/integrations/supabase/client.ts` - Database and auth configuration

### Configuration
- `vite.config.ts` - Build configuration with path aliases
- `tailwind.config.ts` - Styling system with TX brand colors
- `components.json` - shadcn/ui configuration
- `package.json` - Dependencies and scripts

### Deployment
- `server.js` - Production Express server for SPA serving
- Uses Lovable's deployment system with custom domain support

## Development Guidelines

### Code Organization
- Use path aliases (`@/` for src directory)
- Follow existing component patterns from shadcn/ui
- Maintain TypeScript strict mode compliance
- Keep API calls in dedicated utility functions

### State Management
- Use React hooks for local state
- Consider React Query for server state caching if needed
- Supabase handles auth state automatically

### Performance Considerations
- Components use proper useEffect cleanup for intervals
- Audio elements are preloaded for alert notifications
- Polling intervals are configurable and cleanly managed
- Build optimization through Vite's default settings

### Adding New Features
1. Create components in appropriate directory (`components/` for features, `components/ui/` for reusable UI)
2. Add new routes to `App.tsx` if needed
3. Update API integration in `lib/api.ts` for backend communication
4. Follow existing TypeScript interfaces for data structures
5. Use existing styling patterns and TX brand colors
6. Test alert functionality if adding new notification features