// TypeScript declarations for environment variables

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV?: 'development' | 'production' | 'test';
    readonly REACT_APP_SUPABASE_URL?: string;
    readonly REACT_APP_SUPABASE_ANON_KEY?: string;
    readonly REACT_APP_PHONEPE_MERCHANT_ID?: string;
    readonly REACT_APP_PHONEPE_SALT_KEY?: string;
    readonly REACT_APP_PHONEPE_SALT_INDEX?: string;
  }
}

// Global window extensions
declare interface Window {
  process?: {
    env: Record<string, string | undefined>;
  };
  __REACT_APP_ENV__?: Record<string, string | undefined>;
}
