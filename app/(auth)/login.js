import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../styles/theme';
export default function LoginScreen({ navigation }) {
  // 1. Initialize React Hook Form
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onLogin = async (data) => {
    // REQUIREMENT: Identifier (email) must be trimmed (no extra spaces)
    // The 'data' object is now guaranteed to exist by react-hook-form
    const cleanEmail = data.email?.trim() || '';
    
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: data.password,
    });

    if (error) {
      // REQUIREMENT: Generic error message to avoid leaking user info
      Alert.alert("Authentication Failed", "Invalid credentials. Please try again.");
      return;
    }
    const onLogin = async (data) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email.trim(), // Ensure no trailing spaces
        password: data.password,
      });
    
      if (error) {
        // Check the console to see the real reason (Invalid credentials, etc)
        console.log("Auth Error Details:", error.status, error.message);
        
        // Requirement: Generic message for the user
        Alert.alert("Login Failed", "The email or password you entered is incorrect.");
        return;
      }
      
      // Success logic...
    };
    // Check for MFA/AAL level logic
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
      navigation.navigate('MFA');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      {/* Email Field with Controller */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Email Address</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="email@example.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
      </View>

      {/* Password Field with Controller */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
            />
          )}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit(onLogin)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>
          New here? <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>Create Account</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0f172a', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 40 },
  inputWrapper: { marginBottom: 20 },
  label: { color: '#94a3b8', marginBottom: 8, fontSize: 14 },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    padding: 16, 
    color: '#fff', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  button: { backgroundColor: '#6366f1', padding: 18, borderRadius: 12, marginTop: 10, height: 56, justifyContent: 'center' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#94a3b8', textAlign: 'center', marginTop: 24 }
});