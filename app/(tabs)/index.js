import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase'; // Correct relative path
import { Theme } from '../../styles/theme';   // Correct relative path

export default function HomeScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.text}>Welcome to your secure area.</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 10 },
  text: { color: Theme.colors.textMuted, marginBottom: 30 },
  button: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.error },
  buttonText: { color: Theme.colors.error, fontWeight: 'bold' }
});