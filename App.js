import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      if (user) {
        // Using maybeSingle() instead of single() to prevent 406/PGRST116 errors
        const { data, error } = await supabase
          .from('profiles')
          .select('username, phone_number, dob') 
          .eq('id', user.id)
          .maybeSingle(); 

        if (error) throw error;

        if (data) {
          setProfile({ ...data, email: user.email });
          setEditUsername(data.username || '');
          setEditPhone(data.phone_number || '');
        } else {
          // If no profile row exists, just show the email from Auth
          setProfile({ email: user.email });
        }
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error.message);
      // If you still see 406 here, the issue is purely in the Supabase Dashboard cache
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Upsert ensures that if the row was missing (causing the 406), it gets created now
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: editUsername,
          phone_number: editPhone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(); 
    } catch (error) {
      Alert.alert("Update Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Account Profile</Text>
          <Text style={styles.subtitle}>{isEditing ? 'Update your details' : 'Welcome back!'}</Text>
          
          {loading && !isEditing ? (
            <ActivityIndicator color="#6366f1" size="large" />
          ) : (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Username</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.editInput} 
                    value={editUsername} 
                    onChangeText={setEditUsername}
                    placeholder="Enter username"
                    placeholderTextColor="#64748b"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile?.username || 'Not set'}</Text>
                )}
              </View>

              <View style={[styles.infoBox, { opacity: 0.6 }]}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profile?.email || 'Loading...'}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.editInput} 
                    value={editPhone} 
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    placeholderTextColor="#64748b"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile?.phone_number || 'Not provided'}</Text>
                )}
              </View>

              <View style={[styles.infoBox, { opacity: isEditing ? 0.6 : 1 }]}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{profile?.dob || 'Not provided'}</Text>
              </View>
            </>
          )}

          <View style={{ width: '100%', marginTop: 10 }}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                  <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
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
  editInput: { color: '#f8fafc', fontSize: 16, marginTop: 4, fontWeight: '600', padding: 0, borderBottomWidth: 1, borderBottomColor: '#334155' },
  editButton: { backgroundColor: '#6366f1', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  saveButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  signOutButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  cancelButton: { padding: 15, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelText: { color: '#94a3b8', fontWeight: '600' },
});