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

// Type for environment variables
interface ProcessEnv {
  NODE_ENV?: string;
  REACT_APP_SUPABASE_URL?: string;
  REACT_APP_SUPABASE_ANON_KEY?: string;
  REACT_APP_PHONEPE_MERCHANT_ID?: string;
  REACT_APP_PHONEPE_SALT_KEY?: string;
  REACT_APP_PHONEPE_SALT_INDEX?: string;
  [key: string]: string | undefined;
}

// Safe environment variable getter
const getProcessEnv = (): ProcessEnv => {
  // CRA injects env at build time; at runtime on the client, process may not exist.
  const env = (typeof process !== 'undefined' && (process as any).env)
    ? (process as any).env
    : {};
  return env as ProcessEnv;
};

// Function to safely get environment variables
const getEnvironmentConfig = (): EnvironmentConfig => {
  try {
    const env = getProcessEnv();
    
    return {
      supabaseUrl: env.REACT_APP_SUPABASE_URL || null,
      supabaseAnonKey: env.REACT_APP_SUPABASE_ANON_KEY || null,
      phonepeConfig: {
        merchantId: env.REACT_APP_PHONEPE_MERCHANT_ID || null,
        saltKey: env.REACT_APP_PHONEPE_SALT_KEY || null,
        saltIndex: env.REACT_APP_PHONEPE_SALT_INDEX || null,
      },
      isProduction: env.NODE_ENV === 'production',
      isDevelopment: env.NODE_ENV === 'development' || !env.NODE_ENV,
    };
  } catch (error) {
    console.error('Error accessing environment variables:', error);
    return {
      supabaseUrl: null,
      supabaseAnonKey: null,
      phonepeConfig: {
        merchantId: null,
        saltKey: null,
        saltIndex: null,
      },
      isProduction: false,
      isDevelopment: true,
    };
  }
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
  console.log('- Process available:', typeof process !== 'undefined');
  console.log('- NODE_ENV:', config.isDevelopment ? 'development' : config.isProduction ? 'production' : 'unknown');
  console.log('- Supabase URL:', config.supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- Supabase Key:', config.supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('- Validation:', validation.isValid ? '✅ Valid' : '❌ Invalid');
  
  if (!validation.isValid) {
    console.log('- Missing variables:', validation.missing);
  }
};
