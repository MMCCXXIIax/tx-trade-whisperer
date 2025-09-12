# Overview

This is TX – Trade Whisperer, an AI-powered trading intelligence platform that provides pattern detection and trading signals for both demo and live markets. The application combines a React frontend with an Express.js backend to deliver real-time market analysis, paper trading capabilities, and trading alerts.

The platform is designed as a comprehensive trading assistant that scans markets, detects patterns using AI, and provides actionable trading intelligence to users. It supports both demo mode for learning and live mode for actual trading.

## Recent Changes (September 8, 2025)
- Successfully imported from GitHub and configured for Replit environment
- Frontend configured to run on port 5000 with proper host settings (0.0.0.0)
- Backend configured to run on port 3000 with localhost binding
- PostgreSQL database created and schema pushed successfully
- Workflow configured to run both frontend and backend simultaneously
- Deployment configuration set up for autoscale target

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom TX brand color palette (green: #00ff88, black: #121212)
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: React Router with protected routes and authentication guards
- **Charts**: Lightweight Charts library for candlestick visualization

## Backend Architecture  
- **Framework**: Express.js with Node.js for API endpoints
- **Database**: Drizzle ORM with Neon PostgreSQL database via @neondatabase/serverless
- **Authentication**: Supabase Auth for user management and JWT tokens
- **Data Processing**: Custom AI pattern detection modules and market data routing
- **Paper Trading**: Simulated trading engine for demo accounts
- **WebSocket**: Socket.io for real-time pattern alerts and notifications

## Authentication & Authorization
- **Provider**: Supabase Auth handles OAuth flows and session management
- **Route Protection**: Protected routes require authentication, with fallbacks for guests
- **Profile Management**: User profiles stored in Supabase with trading mode preferences
- **Session Handling**: Automatic session refresh and routing based on auth state

## Data Flow Architecture
- **Real-time Updates**: Polling-based updates for market data and trading signals
- **API Layer**: Centralized API utilities with retry logic and error handling
- **State Synchronization**: React Query manages server state caching and invalidation
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks

## Trading Engine Design
- **Pattern Detection**: AI-powered analysis of market patterns with confidence scoring
- **Alert System**: Real-time notifications for trading opportunities
- **Paper Trading**: Virtual trading environment for risk-free practice
- **Portfolio Tracking**: Real-time position monitoring and P&L calculations

# External Dependencies

## Authentication & Database
- **Supabase**: Primary authentication provider and PostgreSQL database hosting
- **Neon Database**: Serverless PostgreSQL with connection pooling via @neondatabase/serverless

## UI & Visualization
- **Radix UI**: Unstyled, accessible component primitives (@radix-ui/react-*)
- **Lightweight Charts**: TradingView-quality candlestick charts for market visualization
- **Lucide React**: Icon library for consistent UI iconography

## Data & API Integration
- **Market Data APIs**: External market data providers for real-time price feeds
- **AI/ML Services**: Pattern detection and trading signal generation
- **WebSocket Connections**: Real-time data streaming capabilities

## Development & Build Tools
- **Vite**: Fast frontend build tool with HMR support
- **TypeScript**: Type safety across the entire frontend codebase
- **ESLint**: Code quality and consistency enforcement
- **Vercel/Render**: Production deployment platforms

## Third-party Services
- **Email Services**: Transactional emails for alerts and notifications
- **Monitoring**: Application performance and error tracking
- **CDN**: Static asset delivery and global content distribution