import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Theme } from '../../styles/theme';
import React from 'react';

export const InputField = ({ label, error, ...props }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.glassInput}>
      <TextInput 
        placeholderTextColor="rgba(255,255,255,0.4)" 
        style={styles.input} 
        {...props} 
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: { color: Theme.colors.text, marginBottom: 8, opacity: 0.8, fontSize: 14 },
  glassInput: {
    backgroundColor: Theme.colors.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
  input: { color: '#fff', fontSize: 16 },
  errorText: { color: Theme.colors.error, fontSize: 12, marginTop: 4 },
});