import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE THESE STRINGS WITH YOUR ACTUAL KEYS FROM SUPABASE DASHBOARD
const supabaseUrl = 'https://cdhfbndqavziaqukyskv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaGZibmRxYXZ6aWFxdWt5c2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTA1ODcsImV4cCI6MjA4NTYyNjU4N30.u4rMRO6UxrdDl8HTjTJPyuYtBfcDR04pYghfJgo500o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});