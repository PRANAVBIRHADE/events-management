// Environment configuration utility
// This approach delays process.env access until runtime

interface EnvironmentConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  phonepeConfig: {
    merchantId: string | null;
    saltKey: string | null;
    saltIndex: string | null;
  };
  isProduction: boolean;
  isDevelopment: boolean;
}

// Build-time environment (CRA replaces these at compile time)
const buildEnv = {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  REACT_APP_PHONEPE_MERCHANT_ID: process.env.REACT_APP_PHONEPE_MERCHANT_ID,
  REACT_APP_PHONEPE_SALT_KEY: process.env.REACT_APP_PHONEPE_SALT_KEY,
  REACT_APP_PHONEPE_SALT_INDEX: process.env.REACT_APP_PHONEPE_SALT_INDEX,
} as const;

// Function to safely get environment variables
const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    supabaseUrl: buildEnv.REACT_APP_SUPABASE_URL || null,
    supabaseAnonKey: buildEnv.REACT_APP_SUPABASE_ANON_KEY || null,
    phonepeConfig: {
      merchantId: buildEnv.REACT_APP_PHONEPE_MERCHANT_ID || null,
      saltKey: buildEnv.REACT_APP_PHONEPE_SALT_KEY || null,
      saltIndex: buildEnv.REACT_APP_PHONEPE_SALT_INDEX || null,
    },
    isProduction: buildEnv.NODE_ENV === 'production',
    isDevelopment: buildEnv.NODE_ENV !== 'production',
  };
};

// Lazy getter for environment config
let cachedConfig: EnvironmentConfig | null = null;

export const getEnvConfig = (): EnvironmentConfig => {
  if (!cachedConfig) {
    cachedConfig = getEnvironmentConfig();
  }
  return cachedConfig;
};

// Validation function
export const validateEnvironment = (): { isValid: boolean; missing: string[] } => {
  const config = getEnvConfig();
  const missing: string[] = [];

  if (!config.supabaseUrl) {
    missing.push('REACT_APP_SUPABASE_URL');
  }

  if (!config.supabaseAnonKey) {
    missing.push('REACT_APP_SUPABASE_ANON_KEY');
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
};

// Debug function
export const debugEnvironment = (): void => {
  const config = getEnvConfig();
  const validation = validateEnvironment();

  console.log('🔍 Environment Debug:');
  console.log('- NODE_ENV:', config.isDevelopment ? 'development' : config.isProduction ? 'production' : 'unknown');
  console.log('- Supabase URL:', config.supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- Supabase Key:', config.supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('- Validation:', validation.isValid ? '✅ Valid' : '❌ Invalid');
  
  if (!validation.isValid) {
    console.log('- Missing variables:', validation.missing);
  }
};
