// Environment variable checker utility - browser safe
export const checkEnvironment = () => {
  // Check if process is available (it should be in Create React App)
  if (typeof process === 'undefined') {
    console.error('❌ process is not defined - this indicates a build configuration issue');
    throw new Error('Environment variables are not available. This is likely a build configuration issue.');
  }

  const requiredEnvVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];

  const missing: string[] = [];
  const present: string[] = [];

  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  console.log('🔍 Environment Variables Check:');
  console.log('✅ Present:', present);
  console.log('❌ Missing:', missing);
  
  // Safe access to process.env
  try {
    const reactAppVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));
    console.log('📁 All REACT_APP_ vars:', reactAppVars);
  } catch (error) {
    console.log('📁 Could not enumerate environment variables');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    isValid: missing.length === 0,
    missing,
    present
  };
};

// Call this function to debug environment issues - browser safe
export const debugEnvironment = () => {
  console.log('🐛 Debug Information:');
  
  // Check if process is available
  if (typeof process === 'undefined') {
    console.error('❌ process is not defined in browser environment');
    console.log('This indicates a potential build configuration issue with Create React App');
    return;
  }

  try {
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- All environment variables starting with REACT_APP_:');
    
    Object.entries(process.env)
      .filter(([key]) => key.startsWith('REACT_APP_'))
      .forEach(([key, value]) => {
        console.log(`  ${key}: ${value ? '***SET***' : 'UNDEFINED'}`);
      });
  } catch (error) {
    console.error('Error accessing environment variables:', error);
  }
};
