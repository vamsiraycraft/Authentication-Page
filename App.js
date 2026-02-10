import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, email, phone, dob')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Account Profile</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
          
          {loading ? (
            <ActivityIndicator color="#6366f1" size="large" />
          ) : (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{profile?.username || 'N/A'}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profile?.email}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{profile?.dob || 'Not provided'}</Text>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          <Stack.Screen name="Profile" component={ProfileScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#f8fafc', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 25 },
  infoBox: { width: '100%', backgroundColor: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#6366f1' },
  infoLabel: { color: '#6366f1', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  infoValue: { color: '#f8fafc', fontSize: 16, marginTop: 4, fontWeight: '600' },
  signOutButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});