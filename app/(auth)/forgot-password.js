import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../styles/theme';

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');

  const handleResetRequest = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'my-rich-app://update-password',
    });

    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Email Sent", "Check your inbox for the reset link.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor={Theme.colors.textMuted}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleResetRequest}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: { backgroundColor: Theme.colors.surface, borderRadius: 12, padding: 16, color: '#fff', marginBottom: 16 },
  button: { backgroundColor: Theme.colors.primary, padding: 18, borderRadius: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});