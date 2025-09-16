# TX Trade Whisperer Deployment Guide

This document provides instructions for deploying the TX Trade Whisperer application to a production environment.

## Build and Start Commands

When deploying to a hosting platform like Render, Vercel, Netlify, or Heroku, use the following build and start commands:

### Build Command
```
npm run build
```

This command will:
1. Install necessary build dependencies
2. Build the React application with Vite
3. Generate optimized production assets in the `dist` directory

### Start Command
```
npm start
```

This command will:
1. Start the Express server defined in `server.js`
2. Serve the static files from the `dist` directory
3. Handle API requests and WebSocket connections
4. Implement SPA fallback for client-side routing

## Environment Variables

Set the following environment variables in your hosting platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for the server to listen on | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `VITE_API_BASE` | Base URL for API requests | `https://your-app-url.com` |

## Deployment Steps

1. **Push your code to GitHub**
   - Create a repository on GitHub
   - Push your local repository to GitHub

2. **Connect to a hosting platform**
   - Create an account on Render, Vercel, Netlify, or Heroku
   - Connect your GitHub repository to the hosting platform

3. **Configure the build settings**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment Variables: Set as described above

4. **Deploy the application**
   - Trigger a manual deploy or let the platform auto-deploy from your main branch

## Hosting Recommendations

### Render
- **Service Type**: Web Service
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: Enable

### Vercel
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions` (if using Netlify Functions)

### Heroku
- **Buildpack**: heroku/nodejs
- **Procfile**: `web: npm start`

## Post-Deployment Verification

After deploying, verify the following:

1. The application loads correctly in the browser
2. API endpoints return expected responses
3. WebSocket connections are established
4. Real-time updates are working
5. Authentication flows are functioning

## Scaling Considerations

As your application grows, consider:

1. Separating the frontend and backend into different services
2. Implementing a database for persistent storage
3. Setting up a CDN for static assets
4. Configuring auto-scaling for the backend services

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs for errors
2. Verify environment variables are set correctly
3. Ensure the server is listening on the correct port
4. Check for CORS issues if frontend and backend are deployed separately
5. Verify WebSocket connections are not being blocked by firewalls or proxies

## Support

For additional support, refer to:
- The documentation of your chosen hosting platform
- The TX Trade Whisperer GitHub repository
- The React and Vite documentation for frontend issues
- The Express and Socket.io documentation for backend issues