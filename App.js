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

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile({ ...data, email: user.email });
        setEditUsername(data?.username || '');
        setEditPhone(data?.phone_number || '');
      }
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({ id: user.id, username: editUsername, phone_number: editPhone });
    if (!error) { Alert.alert("Updated!"); setIsEditing(false); fetchProfile(); }
  };

  const ProfileTile = ({ icon, label, value, editable, onChange }) => (
    <View style={styles.tile}>
        <View style={styles.tileIcon}><Text style={{fontSize: 20}}>{icon}</Text></View>
        <View style={{flex: 1}}>
            <Text style={styles.tileLabel}>{label}</Text>
            {editable ? <TextInput style={styles.tileInput} value={value} onChangeText={onChange} /> : <Text style={styles.tileValue}>{value || '—'}</Text>}
        </View>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#020617'}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.header}>
            <View style={styles.avatar}><Text style={{fontSize: 40}}>👤</Text></View>
            <Text style={styles.headerTitle}>{profile?.username || 'Member'}</Text>
            <Text style={styles.headerSubtitle}>{profile?.email}</Text>
        </View>

        <ProfileTile icon="👤" label="User Name" value={isEditing ? editUsername : profile?.username} editable={isEditing} onChange={setEditUsername} />
        <ProfileTile icon="📞" label="Mobile" value={isEditing ? editPhone : profile?.phone_number} editable={isEditing} onChange={setEditPhone} />
        <ProfileTile icon="📅" label="Date of Birth" value={profile?.dob} />

        <TouchableOpacity style={isEditing ? styles.btnSave : styles.btnEdit} onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}>
            <Text style={styles.btnText}>{isEditing ? "Save Profile" : "Edit Details"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSignOut} onPress={() => supabase.auth.signOut()}>
            <Text style={styles.btnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#6366f1" /></View>;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? <Stack.Screen name="Profile" component={ProfileScreen} /> : (
          <><Stack.Screen name="Login" component={LoginScreen} /><Stack.Screen name="Register" component={RegisterScreen} /></>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: '#020617', justifyContent: 'center' },
  header: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#6366f1' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 10 },
  headerSubtitle: { color: '#94a3b8' },
  tile: { backgroundColor: '#0f172a', padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  tileIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  tileLabel: { color: '#6366f1', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  tileValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  tileInput: { color: '#fff', fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#6366f1' },
  btnEdit: { backgroundColor: '#6366f1', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  btnSave: { backgroundColor: '#10b981', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  btnSignOut: { padding: 18, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800' }
});