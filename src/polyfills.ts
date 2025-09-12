// Polyfills for browser environment

// Ensure process.env is available in development
if (typeof process === 'undefined') {
  console.warn('⚠️ process is not defined, creating polyfill for environment variables');
  
  // Create a minimal process polyfill
  const mockEnv = {
    NODE_ENV: 'development',
    REACT_APP_SUPABASE_URL: '',
    REACT_APP_SUPABASE_ANON_KEY: '',
    REACT_APP_PHONEPE_MERCHANT_ID: '',
    REACT_APP_PHONEPE_SALT_KEY: '',
    REACT_APP_PHONEPE_SALT_INDEX: '',
  };

  // Try to create process object
  try {
    (window as any).process = {
      env: mockEnv as Record<string, string | undefined>
    };
    console.log('🔧 Created window.process polyfill');
  } catch (error) {
    console.warn('Could not create process polyfill, using window fallback');
    (window as any).__REACT_APP_ENV__ = mockEnv as Record<string, string | undefined>;
  }
  
  console.log('📝 Please create a .env.local file with your actual environment variables');
  console.log('🔄 You may need to restart the development server');
}

export {};
