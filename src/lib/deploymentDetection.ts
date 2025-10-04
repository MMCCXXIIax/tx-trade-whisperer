// Deployment detection utility for environment-specific configurations
export const getDeploymentInfo = () => {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isRender = hostname.includes('.onrender.com');
  const isLovable = hostname.includes('lovable.app');
  const isVercel = hostname.includes('.vercel.app');
  const isNetlify = hostname.includes('.netlify.app');

  let environment = 'unknown';
  let expectedCorsOrigin = origin;

  if (isLocal) {
    environment = 'development';
    expectedCorsOrigin = 'http://localhost:8080';
  } else if (isRender) {
    environment = 'render';
    expectedCorsOrigin = 'https://tx-trade-whisperer.onrender.com';
  } else if (isLovable) {
    environment = 'lovable';
    expectedCorsOrigin = origin; // Use actual lovable URL
  } else if (isVercel) {
    environment = 'vercel';
  } else if (isNetlify) {
    environment = 'netlify';
  } else {
    environment = 'production';
  }

  return {
    hostname,
    origin,
    environment,
    expectedCorsOrigin,
    isLocal,
    isProduction: !isLocal,
    platformInfo: {
      isRender,
      isLovable,
      isVercel,
      isNetlify
    }
  };
};

// Log deployment info for debugging
export const logDeploymentInfo = () => {
  const info = getDeploymentInfo();
  console.log('🚀 TX Deployment Info:', {
    environment: info.environment,
    origin: info.origin,
    expectedCorsOrigin: info.expectedCorsOrigin,
    platform: Object.entries(info.platformInfo)
      .find(([_, value]) => value)?.[0] || 'custom'
  });
  
  // Provide CORS guidance
  if (!info.isLocal) {
    console.log(`💡 Backend CORS should include: ${info.expectedCorsOrigin}`);
  }
  
  return info;
};