import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../styles/theme';

export default function MFAScreen() {
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (!factors.all.length) return;

    const factorId = factors.all[0].id;
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    
    if (cErr) return Alert.alert("Error", cErr.message);

    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code
    });

    if (vErr) Alert.alert("Invalid Code", "Please try again.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Access</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code from your authenticator app</Text>
      <TextInput
        style={styles.otpInput}
        placeholder="000000"
        placeholderTextColor={Theme.colors.border}
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify Identity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 30, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text, textAlign: 'center' },
  subtitle: { color: Theme.colors.textMuted, textAlign: 'center', marginVertical: 20 },
  otpInput: { fontSize: 48, color: Theme.colors.text, textAlign: 'center', letterSpacing: 10, marginVertical: 30 },
  button: { backgroundColor: Theme.colors.primary, padding: 18, borderRadius: 12 },
  buttonText: { color: Theme.colors.text, textAlign: 'center', fontWeight: 'bold' }
});