import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext<{ session: Session | null }>({ session: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session) {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        // If user has MFA enrolled but is currently only AAL1
        if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
          router.replace('/(auth)/mfa');
        } else if (segments[0] === '(auth)') {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/(auth)/login');
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
}