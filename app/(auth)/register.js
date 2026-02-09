import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';

const signUpSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password needs at least one uppercase letter')
    .regex(/[0-9]/, 'Password needs at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password needs at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
  });

  const onRegister = async (data) => {
    setLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { username: data.username }
        }
      });

      if (error) throw error;

      Alert.alert(
        "Registration Successful",
        "Please check your email to confirm your account.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, placeholder, secure = false, keyboardType = "default" }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, (errors[name] || (name === 'email' && authError)) && styles.inputError]}
            placeholder={placeholder}
            placeholderTextColor="#64748b"
            secureTextEntry={secure}
            keyboardType={keyboardType}
            onChangeText={(text) => {
              onChange(text);
              if(authError) setAuthError('');
            }}
            value={value}
            autoCapitalize="none"
          />
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name].message}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the innovative community</Text>

        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        <InputField label="Username" name="username" placeholder="johndoe_99" />
        <InputField label="Email" name="email" placeholder="email@example.com" keyboardType="email-address" />
        <InputField label="Password" name="password" placeholder="Min 8 chars, 1 upper, 1 symbol" secure />
        <InputField label="Confirm Password" name="confirmPassword" placeholder="••••••••" secure />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit(onRegister)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.linkText}>Login</Text>
          </Text>
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
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkText: { color: '#6366f1', fontWeight: '700' },
});