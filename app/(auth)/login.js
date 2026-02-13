import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid format').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onLogin = async (data) => {
    setLoading(true);
    setAuthError('');

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setAuthError("Check your inbox! You must verify your email link first.");
        } else if (error.message.includes("Invalid login credentials")) {
          setAuthError("Wrong email or password.");
        } else {
          setAuthError(error.message);
        }
      } 
      // Removed manual navigation.replace('Profile')
      // App.js listener handles state change automatically
      
    } catch (err) {
      setAuthError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, (errors.email || authError) && styles.inputError]}
                placeholder="name@gmail.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoComplete="email"
                onChangeText={(text) => {
                  onChange(text);
                  setAuthError('');
                }}
                value={value}
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, (errors.password || authError) && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoComplete="password"
                onChangeText={(text) => {
                  onChange(text);
                  setAuthError('');
                }}
                value={value}
                autoCapitalize="none"
              />
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit(onLogin)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footerLink}>
          <Text style={styles.footerText}>New here? <Text style={styles.linkText}>Create Account</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, elevation: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  errorBanner: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', marginBottom: 20 },
  errorBannerText: { color: '#ef4444', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  inputGroup: { marginBottom: 15 },
  label: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 15, color: '#f8fafc', borderWidth: 1, borderColor: '#334155' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 5 },
  button: { backgroundColor: '#6366f1', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#4338ca', opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerLink: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#94a3b8' },
  linkText: { color: '#6366f1', fontWeight: '700' },
});