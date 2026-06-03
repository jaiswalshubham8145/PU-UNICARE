import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Helper to get env vars safely in both Vite and Node
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

const SUPABASE_URL = getEnv("VITE_SUPABASE_URL") || "https://izikkwpighftukjtdapn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6aWtrd3BpZ2hmdHVranRkYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjA2NzcsImV4cCI6MjA4MjIzNjY3N30.76qOUyWBrhzpc_fu7KvLI7sJbvkQZorin7FzPgYeBZ4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});