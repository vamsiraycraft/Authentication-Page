import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';

// Import the picker ONLY if we are not on web to avoid the crash
let DateTimePicker;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

// 1. ORIGINAL VALIDATION SCHEMA
const signUpSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  
  email: z.string()
    .min(1, 'Email is required')
    .trim()
    .toLowerCase()
    .refine((val) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) return false;

      const allowedProviders = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
        'icloud.com', 'me.com', 'live.com', 'msn.com', 'aol.com', 'ymail.com'
      ];
      
      const domain = val.split('@')[1];
      const isMajorProvider = allowedProviders.includes(domain);
      const isEduEmail = domain.endsWith('.edu');

      return isMajorProvider || isEduEmail;
    }, {
      message: "Use a real provider (e.g., @gmail.com, @yahoo.com, @outlook.com)"
    }),

  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(14, 'Phone number too long')
    .refine((val) => {
      const indianPhoneRegex = /^(?:\+91|91)?[6789]\d{9}$/;
      return indianPhoneRegex.test(val);
    }, {
      message: "Enter a valid Indian phone number"
    }),

  dob: z.any().refine((val) => {
    const date = new Date(val);
    return date instanceof Date && !isNaN(date) && date < new Date();
  }, { message: "Please enter a valid past date" }),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Needs at least one uppercase letter')
    .regex(/[0-9]/, 'Needs at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Needs at least one special character'),
    
  confirmPassword: z.string(),

  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to continue" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // EXTRA CAUTION STATES
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { 
        username: '', 
        email: '', 
        phone: '', 
        dob: '', 
        password: '', 
        confirmPassword: '',
        terms: false 
    }
  });

  const onRegister = async (data) => {
    setLoading(true);
    setAuthError('');
    try {
      const dateObj = new Date(data.dob);
      const formattedDob = dateObj.toISOString().split('T')[0];

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: { 
          data: { 
            full_name: data.username.trim(),
            phone_number: data.phone.trim(),
            date_of_birth: formattedDob 
          } 
        }
      });

      if (error) throw error;

      // SUCCESS HANDLING WITH CAUTION
      if (authData?.user) {
        setRegisteredEmail(data.email.trim());
        setIsRegistered(true); // Switches UI to the "Verify Email" screen
      }
    } catch (error) {
      setAuthError(error.message || "An unexpected error occurred");
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
            style={[styles.input, (errors[name]) && styles.inputError]}
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

  // --- EXTRA CAUTION VIEW (POST-REGISTRATION) ---
  if (isRegistered) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <View style={styles.card}>
          <Text style={[styles.title, { fontSize: 50, marginBottom: 10 }]}>📧</Text>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to:{"\n"}
            <Text style={{ color: '#f8fafc', fontWeight: 'bold' }}>{registeredEmail}</Text>
          </Text>

          <View style={styles.cautionBanner}>
             <Text style={styles.cautionText}>
               Note: You cannot log in until you click the confirmation link in your email.
             </Text>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Proceed to Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegistered(false)} style={styles.footerLink}>
            <Text style={styles.linkText}>Back to Registration</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- ORIGINAL REGISTRATION VIEW ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in your details below</Text>

        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        <InputField label="Username" name="username" placeholder="johndoe" />
        <InputField label="Email" name="email" placeholder="name@gmail.com" keyboardType="email-address" />
        <InputField label="Phone Number" name="phone" placeholder="9876543210" keyboardType="phone-pad" />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <Controller
            control={control}
            name="dob"
            render={({ field: { value, onChange } }) => (
              <>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    style={{
                      ...styles.input,
                      backgroundColor: '#0f172a',
                      color: value ? '#f8fafc' : '#64748b',
                      outline: 'none',
                    }}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                ) : (
                  <>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={[styles.input, errors.dob && styles.inputError, styles.dateDropdown]} 
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{ color: value ? '#f8fafc' : '#64748b' }}>
                        {value ? new Date(value).toLocaleDateString() : "Select Date"}
                      </Text>
                      <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={value ? new Date(value) : new Date(2000, 0, 1)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            onChange(selectedDate);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </>
            )}
          />
          {errors.dob && <Text style={styles.errorText}>{errors.dob.message}</Text>}
        </View>

        <InputField label="Password" name="password" placeholder="••••••••" secure />
        <InputField label="Confirm Password" name="confirmPassword" placeholder="••••••••" secure />

        <View style={styles.checkboxWrapper}>
            <Controller
                control={control}
                name="terms"
                render={({ field: { onChange, value } }) => (
                    <TouchableOpacity 
                        style={[styles.checkbox, value && styles.checkboxChecked]} 
                        onPress={() => onChange(!value)}
                    >
                        {value && <Text style={styles.checkboxTick}>✓</Text>}
                    </TouchableOpacity>
                )}
            />
            <Text style={styles.checkboxText}>I agree to the <Text style={styles.linkText}>Terms & Conditions</Text></Text>
        </View>
        {errors.terms && <Text style={styles.errorText}>{errors.terms.message}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit(onRegister)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
          <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText}>Login</Text></Text>
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
  cautionBanner: { backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 12, borderRadius: 12, marginVertical: 20, borderLeftWidth: 4, borderLeftColor: '#6366f1' },
  cautionText: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 15, color: '#f8fafc', borderWidth: 1, borderColor: '#334155' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 5 },
  dateDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownIcon: { color: '#94a3b8', fontSize: 12 },
  checkboxWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 5 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#6366f1', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#6366f1' },
  checkboxTick: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  checkboxText: { color: '#94a3b8', fontSize: 14 },
  button: { backgroundColor: '#6366f1', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  buttonDisabled: { backgroundColor: '#4338ca', opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerLink: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkText: { color: '#6366f1', fontWeight: '700' },
});