import { supabase } from "../lib/supabase";

import { useRouter } from 'expo-router';
import React, { useEffect } from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    async function checkMfa() {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
        router.replace('/auth/mfa-verify');
      }
    }
    checkMfa();
  }, [router]);

  return <>{children}</>;
}